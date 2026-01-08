import {useEffect, useState} from "react";
import api from "../services/api.jsx";
import Alert from "../components/Alert.jsx";

const CartPage = ({ onNavigate }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchCart();
    }, [onNavigate]);

    const fetchCart = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const res = await api.get('/cart');
            setCart(res);
        } catch (err) {
            console.error(err);
            setErrorMsg(err.response?.data?.message || 'Gagal memuat keranjang dari server.');
        } finally {
            setLoading(false);
        }
    };

    const plus = async (id) => {
        setLoadingAction(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post(`/cart/plus/${id}`);
            setSuccessMsg('Jumlah barang berhasil ditambah.');
            fetchCart();
        } catch (err) {
            if (err.response?.status === 400) {
                setErrorMsg('Stok tidak mencukupi.');
            } else {
                setErrorMsg('Gagal menambah jumlah barang.');
            }
        } finally {
            setLoadingAction(false);
        }
    };

    const minus = async (id) => {
        setLoadingAction(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post(`/cart/minus/${id}`);
            setSuccessMsg('Jumlah barang berhasil dikurangi.');
            fetchCart();
        } catch {
            setErrorMsg('Gagal mengurangi barang.');
        } finally {
            setLoadingAction(false);
        }
    };

    const discard = async (id) => {
        setLoadingAction(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.delete(`/cart/discard/${id}`);
            setSuccessMsg('Barang dihapus dari keranjang.');
            fetchCart();
        } catch {
            setErrorMsg('Gagal menghapus barang.');
        } finally {
            setLoadingAction(false);
        }
    };

    const checkout = async () => {
        setLoadingAction(true);
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post('/cart/checkout');
            setSuccessMsg('Checkout berhasil!');
            fetchCart();
        } catch {
            setErrorMsg('Checkout gagal. Coba lagi nanti.');
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-700">🛍 Shopping Cart</h1>

            {errorMsg && <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />}
            {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

            {!loading && cart?.items?.length === 0 && (
                <div className="text-center text-gray-500 bg-gray-50 p-6 rounded-lg border">
                    🛒 Keranjang kosong — silakan tambahkan barang dari halaman utama.
                </div>
            )}

            {loading && (
                <div className="text-center text-gray-500 p-6">⏳ Memuat data keranjang...</div>
            )}

            {!loading && cart?.items?.length > 0 && (
                <>
                    <table className="w-full border text-sm text-left">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">Nama</th>
                            <th className="p-2">Harga</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Subtotal</th>
                            <th className="p-2 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cart.items.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="p-2">{item.product.name}</td>
                                <td className="p-2">Rp {item.product.price.toLocaleString()}</td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2">Rp {item.subtotal.toLocaleString()}</td>
                                <td className="p-2 text-center space-x-2">
                                    <button
                                        onClick={() => plus(item.id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                        disabled={loadingAction}
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => minus(item.id)}
                                        className="bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400 disabled:opacity-50"
                                        disabled={loadingAction}
                                    >
                                        -
                                    </button>
                                    <button
                                        onClick={() => discard(item.id)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                                        disabled={loadingAction}
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="mt-6 text-right text-lg font-semibold">
                        Total: Rp {cart.total.toLocaleString()}
                    </div>
                </>
            )}

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => onNavigate('home')}
                    className="bg-gray-300 text-gray-800 px-2 py-1 rounded hover:bg-gray-400"
                >
                    ← Kembali
                </button>
                <button
                    onClick={checkout}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                    disabled={loadingAction || cart?.items?.length === 0}
                >
                    Checkout
                </button>
            </div>
        </div>
    );
};
export default CartPage;
