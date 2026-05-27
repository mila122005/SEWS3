const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { auth, db } = require("./firebase");
const { sendEmail } = require('./utils/sendEmail');

const API_KEY =
  process.env.FIREBASE_API_KEY ||
  "TU_API_KEY_FIREBASE";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// =======================================
// CORREOS DE ADMINISTRADORES
// =======================================
const ADMIN_EMAILS = [
  "leonor.yumi@epn.edu.ec",
  "camila.bueno@epn.edu.ec",
  "concepcion.arequipa@epn.edu.ec",
].map((email) => email.toLowerCase());

// =======================================
// OBTENER ROL SEGÚN EL CORREO
// =======================================
const getRoleByEmail = (email) => {
  if (!email) return "visitante";

  const normalized = email.toLowerCase().trim();

  if (ADMIN_EMAILS.includes(normalized)) {
    return "administrador";
  }

  if (normalized.endsWith("@epn.edu.ec")) {
    return "emprendedor";
  }

  return "visitante";
};

// =======================================
// NORMALIZAR TELÉFONO
// =======================================
const normalizePhone = (phone) => {
  if (!phone) return "";

  return String(phone).replace(/\D/g, "");
};

// =======================================
// GUARDAR PERFIL EN FIRESTORE
// =======================================
const saveUserProfile = async (uid, profile) => {
  await db.collection("users").doc(uid).set(profile, {
    merge: true,
  });
};

// =======================================
// CARGAR PERFIL DESDE FIRESTORE
// =======================================
const loadUserProfile = async (uid) => {
  const doc = await db.collection("users").doc(uid).get();

  return doc.exists ? doc.data() : null;
};

// =======================================
// CREAR CUENTAS ADMINISTRADORAS
// =======================================
const ensureAdminAccounts = async () => {
  for (const email of ADMIN_EMAILS) {
    try {
      let user;

      try {
        // VERIFICAR SI YA EXISTE
        user = await auth.getUserByEmail(email);

        console.log(`Admin existente: ${email}`);
      } catch {
        // CREAR ADMIN SI NO EXISTE
        user = await auth.createUser({
          email,
          password: "123456",
          emailVerified: true,
        });

        console.log(`Admin creado: ${email}`);
      }

      // GUARDAR PERFIL
      await saveUserProfile(user.uid, {
        email,
        role: "administrador",
        nombre: email.split("@")[0],
        phone: "",
        createdAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error(`Error creando admin ${email}:`, error.message);
    }
  }
};

// EJECUTAR CREACIÓN DE ADMINS
ensureAdminAccounts();
app.get("/", (req, res) => {
  res.send("API Firebase funcionando");
});

// REGISTRO
app.post("/api/register", async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      role,
      phone,
    } = req.body;

    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);

    const selectedRole = role || "visitante";

    // VALIDAR DATOS
    if (!normalizedEmail || !password || !nombre) {
      return res.status(400).json({
        mensaje: "Faltan datos obligatorios",
      });
    }

    // VALIDAR CORREO INSTITUCIONAL
    if (!normalizedEmail.endsWith("@epn.edu.ec")) {
      return res.status(400).json({
        mensaje: "Debes usar un correo institucional",
      });
    }

    // VALIDAR LONGITUD DE CONTRASEÑA
    if (password.length < 6) {
      return res.status(400).json({
        mensaje: "La contraseña debe tener mínimo 6 caracteres",
      });
    }

    // VALIDAR TELÉFONO PARA EMPRENDEDOR
    if (
      selectedRole === "emprendedor" &&
      !normalizedPhone
    ) {
      return res.status(400).json({
        mensaje: "El teléfono es obligatorio para emprendedores",
      });
    }

    // IMPEDIR CREAR ADMINS DESDE EL FRONTEND
    if (selectedRole === "administrador") {
      return res.status(403).json({
        mensaje: "No puedes registrar administradores",
      });
    }

    // URL DE FIREBASE SIGNUP
    const signUpUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

    // CREAR USUARIO EN FIREBASE
    const signUpRes = await fetch(signUpUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: normalizedEmail,
        password,
        returnSecureToken: true,
      }),
    });

    const signUpData = await signUpRes.json();

    // MANEJO DE ERRORES
    if (!signUpRes.ok) {
      const errorCode = signUpData.error?.message;

      if (errorCode === "EMAIL_EXISTS") {
        return res.status(400).json({
          mensaje: "El correo ya está registrado",
        });
      }

      return res.status(500).json({
        mensaje: "Error al registrar usuario",
        detalle: signUpData,
      });
    }

    // PERFIL DEL USUARIO
    const profile = {
      email: normalizedEmail,
      role: selectedRole,
      nombre: nombre.trim(),
      phone: normalizedPhone,
      createdAt: new Date().toISOString(),
    };

    // GUARDAR PERFIL
    await saveUserProfile(signUpData.localId, profile);

    // ENVIAR CORREO DE VERIFICACIÓN
    const sendVerifyUrl =
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${API_KEY}`;

    await fetch(sendVerifyUrl, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        requestType: "VERIFY_EMAIL",
        idToken: signUpData.idToken,
      }),
    });

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
      detalle: error.message,
    });
  }
});

// =======================================
// LOGIN
// =======================================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail =
      email?.toLowerCase().trim();

    // VALIDAR DATOS
    if (!normalizedEmail || !password) {
      return res.status(400).json({
        mensaje: "Correo y contraseña requeridos",
      });
    }

    // URL LOGIN FIREBASE
    const url =
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;

    // LOGIN FIREBASE
    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email: normalizedEmail,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    // ERROR LOGIN
    if (!response.ok) {
      return res.status(401).json({
        mensaje:
          data.error?.message || "Credenciales inválidas",
      });
    }

    let role = "visitante";
    let phone = "";
    let nombre = "";

    // CARGAR PERFIL
    const profile =
      await loadUserProfile(data.localId);

    // SI EXISTE PERFIL
    if (profile) {
      role =
        profile.role ||
        getRoleByEmail(normalizedEmail);

      phone = profile.phone || "";

      nombre = profile.nombre || "";
    }

    // SI NO EXISTE PERFIL
    else {
      role =
        getRoleByEmail(normalizedEmail);

      const newProfile = {
        email: normalizedEmail,
        role,
        nombre: "",
        phone: "",
        createdAt: new Date().toISOString(),
      };

      await saveUserProfile(
        data.localId,
        newProfile
      );
    }

    // RESPUESTA LOGIN
    res.json({
      mensaje: "Login exitoso",
      token: data.idToken,
      uid: data.localId,
      email: data.email,
      role,
      phone,
      name: nombre,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error interno del servidor",
    });
  }
});

// GOOGLE SIGN IN
app.post("/api/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    // VALIDAR TOKEN
    if (!idToken) {
      return res.status(400).json({
        mensaje: "Falta idToken",
      });
    }

    // VERIFICAR TOKEN
    const decoded =
      await auth.verifyIdToken(idToken);

    const {
      uid,
      email,
      name,
      picture,
    } = decoded;

    const normalizedEmail =
      email?.toLowerCase().trim();

    let userRecord;

    try {
      // BUSCAR USUARIO
      userRecord =
        await auth.getUser(uid);

    } catch {

      // CREAR SI NO EXISTE
      userRecord =
        await auth.createUser({
          uid,
          email: normalizedEmail,
          displayName: name || "",
          photoURL: picture || null,
        });
    }

    // OBTENER ROL
    let role =
      getRoleByEmail(normalizedEmail);

    // CARGAR PERFIL
    const existingProfile =
      await loadUserProfile(uid);

    // SI NO EXISTE PERFIL
    if (!existingProfile) {
      await saveUserProfile(uid, {
        email: normalizedEmail,
        role,
        nombre: name || "",
        phone: "",
        createdAt: new Date().toISOString(),
      });
    }

    // CREAR CUSTOM TOKEN
    const customToken =
      await auth.createCustomToken(uid);

    // RESPUESTA
    res.json({
      mensaje: "Google login exitoso",
      uid,
      email: normalizedEmail,
      role,
      customToken,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error en Google Sign-In",
      detalle: error.message,
    });
  }
});

// PRODUCTOS

const productCollection = db.collection('products');

app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await productCollection.get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await productCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
});

app.get('/api/products/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await productCollection.where('userId', '==', userId).get();
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos por usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos del usuario' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await productCollection.add(product);
    res.status(201).json({ id: docRef.id, ...product });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : 0,
      updatedAt: new Date().toISOString(),
    };
    await productCollection.doc(id).update(product);
    res.json({ id, ...product });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await productCollection.doc(id).delete();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
});

// CONTACT / ENVIAR MENSAJE A ADMINS
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    const to = ADMIN_EMAILS.join(',');

    const html = `
      <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Asunto:</strong> ${subject || 'Contacto desde sitio'}</p>
      <hr />
      <div>${message.replace(/\n/g, '<br/>')}</div>
    `;

    await sendEmail({
      to,
      subject: subject || `Mensaje desde SWES: ${name}`,
      html,
      replyTo: email,
    });

    res.json({ mensaje: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error enviando mensaje de contacto:', error);
    res.status(500).json({ mensaje: 'Error al enviar mensaje' });
  }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});