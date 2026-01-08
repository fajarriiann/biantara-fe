import {useEffect, useRef, useState} from "react";
import api from "../services/api.jsx";
import Alert from "../components/Alert.jsx";

const HomePage = ({ onNavigate }) => {
    const [form, setForm] = useState({ name: '', price: '', stock: '', image: null });
    const [products, setProducts] = useState({ data: [], current_page: 1 });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, [onNavigate]);

    const fetchProducts = async (page = 1) => {
        setLoadingProducts(true);
        setErrorMsg('');
        try {
            const data = await api.get(`/products?page=${page}`);
            setProducts(data);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal memuat produk.');
        } finally {
            setLoadingProducts(false);
        }
    };

    const onFileChange = (e) => {
        setForm({ ...form, image: e.target.files[0] });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMsg('');
        setErrorMsg('');
        setLoading(true);

        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            await api.upload('/products', fd);

            setSuccessMsg('Barang berhasil diupload!');
            setForm({ name: '', price: '', stock: '', image: null });
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchProducts();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else if (err.response?.data?.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg('Gagal mengupload produk. Coba lagi nanti.');
            }
        } finally {
            setLoading(false);
        }
    };

    const buy = async (id) => {
        setSuccessMsg('');
        setErrorMsg('');
        try {
            await api.post(`/cart/add/${id}`);
            setSuccessMsg('Barang ditambahkan ke cart!');
            await fetchProducts();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Gagal menambahkan barang ke cart.');
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-700">🛒 Supermarket - Upload Produk</h1>

            {(errorMsg || Object.keys(errors).length > 0) && (
                <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-lg border border-red-300">
                    {errorMsg && <p>{errorMsg}</p>}
                    {Object.keys(errors).length > 0 && (
                        <ul>
                            {Object.entries(errors).map(([field, msgs]) => (
                                msgs && <li key={field}><strong>{field}</strong>: {msgs[0]}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

            <div className="bg-white shadow p-4 rounded-lg mb-8 space-y-3">
                <div>
                    <label className="block text-gray-600 font-medium mb-1">Nama Barang *</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama Barang"
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-1">Harga *</label>
                    <input
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        placeholder="Harga"
                        type="number"
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        required
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-1">Stok *</label>
                    <input
                        value={form.stock}
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        placeholder="Stok"
                        type="number"
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        required
                        min="1"
                    />
                </div>

                <div>
                    <label className="block text-gray-600 font-medium mb-1">Gambar (JPG/PNG) *</label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={onFileChange}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        accept=".jpg,.png"
                        required
                    />
                </div>

                <button
                    onClick={submitForm}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:bg-blue-300"
                >
                    {loading ? 'Mengunggah...' : 'Upload Barang'}
                </button>
            </div>

            {loadingProducts && (
                <div className="text-gray-500 text-center py-4">⏳ Memuat daftar produk...</div>
            )}

            {!loadingProducts && products.data && products.data.length === 0 && (
                <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border">
                    Belum ada produk tersedia.
                </div>
            )}

            {!loadingProducts && products.data && products.data.length > 0 && (
                <>
                    <h2 className="text-xl font-semibold mb-2">Daftar Barang (stok &gt; 0)</h2>
                    <table className="w-full border text-sm text-left">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">No</th>
                            <th className="p-2">Nama</th>
                            <th className="p-2">Harga</th>
                            <th className="p-2">Stok</th>
                            <th className="p-2">Gambar</th>
                            <th className="p-2">Kode</th>
                            <th className="p-2 text-center">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.data.map((p, i) => (
                            <tr key={p.id} className="border-t">
                                <td className="p-2">{i + 1}</td>
                                <td className="p-2">{p.name}</td>
                                <td className="p-2">Rp {p.price.toLocaleString()}</td>
                                <td className="p-2">{p.stock}</td>
                                <td className="p-2">
                                    <img src={api.imgUrl(p.image)} className="h-12 rounded" alt="product" />
                                </td>
                                <td className="p-2">{p.code}</td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => buy(p.id)}
                                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                    >
                                        Beli
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between mt-4">
                        {products.prev_page_url && (
                            <button
                                onClick={() => fetchProducts(products.current_page - 1)}
                                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                            >
                                Prev
                            </button>
                        )}
                        {products.next_page_url && (
                            <button
                                onClick={() => fetchProducts(products.current_page + 1)}
                                className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </>
            )}

            <button
                onClick={() => onNavigate('cart')}
                className="block text-center mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                Lihat Shopping Cart
            </button>
        </div>
    );
};
export default HomePage;