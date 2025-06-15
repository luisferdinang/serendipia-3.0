import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCf15J1aznKNnQNUlZS_yUfrYM5BBiwcNc",
  authDomain: "finanza-serendipia.firebaseapp.com",
  projectId: "finanza-serendipia",
  storageBucket: "finanza-serendipia.firebasestorage.app",
  messagingSenderId: "684524164609",
  appId: "1:684524164609:web:8989c8b1d2a1482f3b9200",
  measurementId: "G-S06WSTC1XZ"
};

console.log('Inicializando Firebase...');

// Inicializar Firebase
let app: FirebaseApp;
let db: Firestore;
let analytics: Analytics | undefined;

console.group('Inicialización de Firebase');
try {
  // Verificar si ya hay una aplicación inicializada
  const apps = getApps();
  console.log('Aplicaciones Firebase existentes:', apps.length);
  
  // Usar la instancia existente si ya existe
  app = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  console.log('Aplicación Firebase inicializada:', app.name);
  
  // Inicializar Firestore
  console.log('Inicializando Firestore...');
  db = getFirestore(app);
  console.log('Firestore inicializado correctamente');
  
  // Inicializar Analytics solo en el cliente
  if (typeof window !== 'undefined') {
    console.log('Inicializando Analytics...');
    isSupported().then(yes => {
      if (yes) {
        analytics = getAnalytics(app);
        console.log('Analytics inicializado correctamente');
      } else {
        console.log('Analytics no es compatible en este entorno');
      }
    }).catch(analyticsError => {
      console.error('Error al inicializar Analytics:', analyticsError);
    });
  } else {
    console.log('Entorno de servidor detectado, omitiendo inicialización de Analytics');
  }
  
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', {
    message: error instanceof Error ? error.message : 'Error desconocido',
    code: (error as any)?.code,
    details: (error as any)?.details,
    stack: error instanceof Error ? error.stack : undefined
  });
  // Asegurarse de que db esté definido incluso si hay un error
  if (!db && app) {
    db = getFirestore(app);
    console.warn('Se inicializó Firestore después de un error');
  }
} finally {
  console.groupEnd();
}

export { db, analytics };
