import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useCartContext} from '../context/CartContext';
import CleverTap from 'clevertap-react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Trash2, CreditCard} from 'lucide-react-native';
import Toast from 'react-native-toast-message'; // <--- IMPORT TOAST

const CartScreen = () => {
  const {cartItems, removeFromCart, clearCart, cartTotal} = useCartContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      const chargeID = 'TXN_' + Math.floor(Math.random() * 1000000);

      // 1. CLEVERTAP CHARGED EVENT
      const chargeDetails = {
        Amount: cartTotal,
        'Payment Mode': 'Credit Card',
        'Charged ID': chargeID,
        Currency: 'USD',
      };

      const items = cartItems.map(item => ({
        Category: item.category || 'Movie',
        'Product Name': item.title,
        Quantity: 1,
        Price: item.price,
      }));

      CleverTap.recordChargedEvent(chargeDetails, items);

      // 2. UI RESET
      setIsProcessing(false);
      clearCart();

      // 3. ✨ COOL TOAST REPLACEMENT ✨
      Toast.show({
        type: 'success',
        text1: 'Purchase Successful! 🎉',
        text2: `Order #${chargeID} confirmed. Enjoy the show!`,
        visibilityTime: 4000, // Show a bit longer for success
      });
    }, 2000);
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.cartItem}>
      <Image source={{uri: item.image}} style={styles.poster} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.id)}
        style={styles.trashBtn}>
        <Trash2 color="#666" size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <LinearGradient
        colors={['#000', '#111']}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.headerTitle}>My Cart ({cartItems.length})</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <Text style={styles.subText}>Rent movies to watch them anytime.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              disabled={isProcessing}>
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <CreditCard color="#fff" size={20} style={{marginRight: 8}} />
                  <Text style={styles.checkoutText}>Pay Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#000', paddingTop: 60},
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {paddingHorizontal: 20, paddingBottom: 150},
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginBottom: 12,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  poster: {width: 50, height: 75, borderRadius: 4, backgroundColor: '#333'},
  info: {flex: 1, marginLeft: 12},
  title: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  category: {color: '#888', fontSize: 12, marginTop: 4},
  price: {color: '#E50914', fontSize: 14, fontWeight: 'bold', marginTop: 4},
  trashBtn: {padding: 10},
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
  subText: {color: '#888', marginTop: 8},
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {color: '#aaa', fontSize: 16},
  totalAmount: {color: '#fff', fontSize: 24, fontWeight: 'bold'},
  checkoutBtn: {
    backgroundColor: '#E50914',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E50914',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  checkoutText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
});

export default CartScreen;
