import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

// CONFIGURACIÓN: Cambia esta URL por la IP de tu computadora
// Para encontrar tu IP: ipconfig (Windows) o ifconfig (Mac/Linux)
// Ejemplo: const API_URL = 'http://192.168.1.100:3000';
const API_URL = 'http://192.168.0.150:3000'; // ⚠️ CAMBIAR POR TU IP

export default function App() {
  const [screen, setScreen] = useState('login');
  const [token, setToken] = useState('');
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Products states
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Scanner states
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // ==================== FUNCIONES DE API ====================

  // LOGIN - Autenticación con JWT
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username.trim(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setToken(data.token);
        setScreen('home');
        loadProducts(data.token);
        Alert.alert('✅ Éxito', 'Inicio de sesión exitoso');
      } else {
        Alert.alert('❌ Error', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('❌ Error de Conexión', 
        `No se pudo conectar con el servidor.\n\nVerifica que:\n1. El servidor esté corriendo\n2. La URL sea correcta: ${API_URL}\n3. Estés en la misma red WiFi`
      );
      console.error('Error de login:', error);
    } finally {
      setLoading(false);
    }
  };

  // CARGAR TODOS LOS PRODUCTOS
  const loadProducts = async (authToken = token) => {
    try {
      const response = await fetch(`${API_URL}/productos`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401) {
        Alert.alert('Sesión Expirada', 'Por favor inicia sesión nuevamente');
        handleLogout();
      } else {
        Alert.alert('Error', 'No se pudieron cargar los productos');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar productos');
      console.error('Error cargando productos:', error);
    }
  };

  // CONSULTAR PRODUCTO POR ID (desde código QR)
  const getProductById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const product = await response.json();
        setSelectedProduct(product);
        setScreen('home');
        Alert.alert('✅ Producto Encontrado', `${product.nombre}`);
      } else if (response.status === 404) {
        Alert.alert('❌ Error', `Producto con ID ${id} no encontrado`);
        setScreen('home');
      } else {
        Alert.alert('Error', 'No se pudo consultar el producto');
        setScreen('home');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al consultar producto');
      console.error('Error consultando producto:', error);
      setScreen('home');
    } finally {
      setLoading(false);
    }
  };

  // ACTUALIZAR STOCK (aumentar o disminuir)
  const updateStock = async (productId, newQuantity) => {
    if (newQuantity < 0) {
      Alert.alert('⚠️ Advertencia', 'La cantidad no puede ser negativa');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/productos/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad: newQuantity }),
      });

      if (response.ok) {
        Alert.alert('✅ Éxito', 'Stock actualizado correctamente');
        await loadProducts();
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct({ ...selectedProduct, cantidad: newQuantity });
        }
      } else {
        const errorData = await response.json();
        Alert.alert('❌ Error', errorData.message || 'No se pudo actualizar el stock');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar stock');
      console.error('Error actualizando stock:', error);
    } finally {
      setLoading(false);
    }
  };

  // MANEJO DE ESCANEO DE CÓDIGO QR
  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      console.log('Código QR escaneado:', data);
      getProductById(data);
    }
  };

  // CERRAR SESIÓN
  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            setToken('');
            setUsername('');
            setPassword('');
            setProducts([]);
            setSelectedProduct(null);
            setScreen('login');
          }
        }
      ]
    );
  };

  // ==================== PANTALLAS ====================

  // PANTALLA DE LOGIN
  if (screen === 'login') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <View style={styles.loginContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📦</Text>
            <Text style={styles.title}>Inventario Inteligente</Text>
            <Text style={styles.subtitle}>Sistema de gestión con QR</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.infoText}>
              💡 Asegúrate que el servidor esté corriendo en{'\n'}
              {API_URL}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // PANTALLA DE SCANNER QR
  if (screen === 'scanner') {
    if (!permission) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4ecca3" />
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorIcon}>📷</Text>
          <Text style={styles.errorText}>Permiso de cámara requerido</Text>
          <Text style={styles.errorSubtext}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>Otorgar Permiso</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => setScreen('home')}
          >
            <Text style={styles.buttonText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerBox}>
            <View style={styles.scannerCorner} />
          </View>
          
          <Text style={styles.scannerTitle}>Escanear Código QR</Text>
          <Text style={styles.scannerText}>
            Coloca el código QR dentro del recuadro
          </Text>

          {scanned && (
            <View style={styles.scannerButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.buttonText}>🔄 Escanear de Nuevo</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={() => {
              setScanned(false);
              setScreen('home');
            }}
          >
            <Text style={styles.buttonText}>✕ Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // PANTALLA PRINCIPAL (HOME)
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📦 Inventario</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} productos registrados
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir →</Text>
        </TouchableOpacity>
      </View>

      {/* Botón Escanear QR */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => {
          setScanned(false);
          setSelectedProduct(null);
          setScreen('scanner');
        }}
      >
        <Text style={styles.scanButtonIcon}>📷</Text>
        <Text style={styles.scanButtonText}>Escanear Código QR</Text>
      </TouchableOpacity>

      {/* Producto Seleccionado (desde QR) */}
      {selectedProduct && (
        <View style={styles.selectedProduct}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedBadge}>🎯 Producto Escaneado</Text>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.productName}>{selectedProduct.nombre}</Text>
          
          {selectedProduct.descripcion && (
            <Text style={styles.productDescription}>
              {selectedProduct.descripcion}
            </Text>
          )}
          
          <View style={styles.stockInfo}>
            <Text style={styles.stockLabel}>Stock Actual:</Text>
            <Text style={styles.stockValue}>
              {selectedProduct.cantidad} unidades
            </Text>
          </View>
          
          <View style={styles.stockActions}>
            <TouchableOpacity
              style={styles.stockButton}
              onPress={() =>
                updateStock(
                  selectedProduct.id,
                  Math.max(0, selectedProduct.cantidad - 1)
                )
              }
              disabled={loading || selectedProduct.cantidad === 0}
            >
              <Text style={styles.stockButtonText}>− Disminuir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.stockButton, styles.stockButtonAdd]}
              onPress={() =>
                updateStock(
                  selectedProduct.id,
                  selectedProduct.cantidad + 1
                )
              }
              disabled={loading}
            >
              <Text style={styles.stockButtonText}>+ Aumentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Lista de Productos */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Todos los Productos</Text>
          <TouchableOpacity 
            onPress={() => loadProducts()}
            disabled={loading}
          >
            <Text style={styles.refreshText}>
              {loading ? '⏳' : '🔄'} Actualizar
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productCardName}>{item.nombre}</Text>
                {item.descripcion && (
                  <Text style={styles.productCardDescription}>
                    {item.descripcion}
                  </Text>
                )}
                <View style={styles.stockBadge}>
                  <Text style={[
                    styles.productCardStock,
                    item.cantidad < 10 && styles.stockLow,
                    item.cantidad === 0 && styles.stockEmpty
                  ]}>
                    {item.cantidad === 0 ? '⚠️ Sin Stock' : `📦 ${item.cantidad} unidades`}
                  </Text>
                </View>
              </View>
              
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={[styles.quickButton, item.cantidad === 0 && styles.quickButtonDisabled]}
                  onPress={() => updateStock(item.id, Math.max(0, item.cantidad - 1))}
                  disabled={loading || item.cantidad === 0}
                >
                  <Text style={styles.quickButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickButton, styles.quickButtonAdd]}
                  onPress={() => updateStock(item.id, item.cantidad + 1)}
                  disabled={loading}
                >
                  <Text style={styles.quickButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          refreshing={loading}
          onRefresh={() => loadProducts()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  button: {
    backgroundColor: '#0f3460',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#533483',
  },
  buttonDanger: {
    backgroundColor: '#e94560',
  },
  infoText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4ecca3',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#0f3460',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4ecca3',
  },
  scanButtonIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedProduct: {
    backgroundColor: '#16213e',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ecca3',
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedBadge: {
    color: '#4ecca3',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  closeButton: {
    color: '#e94560',
    fontSize: 24,
    fontWeight: 'bold',
  },
  productName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 15,
    lineHeight: 20,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stockLabel: {
    color: '#aaa',
    fontSize: 14,
    marginRight: 8,
  },
  stockValue: {
    color: '#4ecca3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stockActions: {
    flexDirection: 'row',
    gap: 10,
  },
  stockButton: {
    flex: 1,
    backgroundColor: '#e94560',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  stockButtonAdd: {
    backgroundColor: '#4ecca3',
  },
  stockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#4ecca3',
    fontSize: 14,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productCardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productCardDescription: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
  },
  productCardStock: {
    color: '#4ecca3',
    fontSize: 14,
    fontWeight: '600',
  },
  stockLow: {
    color: '#ffa500',
  },
  stockEmpty: {
    color: '#e94560',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#e94560',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickButtonAdd: {
    backgroundColor: '#4ecca3',
  },
  quickButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.5,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 16,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4ecca3',
    borderRadius: 20,
    marginBottom: 40,
  },
  scannerCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#4ecca3',
    borderTopLeftRadius: 20,
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scannerText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  scannerButtons: {
    width: '100%',
    marginBottom: 15,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  errorIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  errorText: {
    color: '#e94560',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
});