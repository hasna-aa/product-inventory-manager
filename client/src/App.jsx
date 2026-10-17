
import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });

  // Get products from MongoDB
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load products");
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setMessage("Cannot connect to backend. Check server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = editId ? `${API_URL}/${editId}` : API_URL;
    const method = editId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      if (editId) {
        setProducts((current) =>
          current.map((product) =>
            product._id === editId ? data : product
          )
        );
        setMessage("Product updated successfully!");
      } else {
        setProducts((current) => [data, ...current]);
        setMessage("Product saved successfully!");
      }

      setForm({
        name: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
      });

      setEditId(null);
      setShowForm(false);
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      quantity: String(product.quantity),
      description: product.description || "",
    });

    setEditId(product._id);
    setShowForm(true);
    setMessage("");
  };

  // Delete product
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((current) =>
        current.filter((product) => product._id !== id)
      );

      setMessage("Product deleted successfully!");
    } catch (error) {
      setMessage(error.message || "Something went wrong");
    }
  };

  // Dashboard calculations
  const totalStock = products.reduce(
    (total, product) => total + product.quantity,
    0
  );
  const lowStockCount = products.filter(
  (product) => product.quantity < 5
).length;

  const lowStock = products.filter(
    (product) => product.quantity <= 5
  ).length;

  const totalValue = products.reduce(
  (total, product) => total + product.price * product.quantity,
  0
);
 
const filteredProducts = products.filter((product) => {
  const matchesSearch =
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase());

  const matchesCategory =
    categoryFilter === "" || product.category === categoryFilter;

  return matchesSearch && matchesCategory;
});

  return (
    <div className="app">
      <h1>Product Inventory Manager</h1>
      <p>Manage your shop products easily.</p>

      <div className="dashboard">
        <div className="card">
          <h3>Total Products</h3>
          <h2>{products.length}</h2>
        </div>

        <div className="card">
          <h3>Total Stock</h3>
          <h2>{totalStock}</h2>
        </div>

        <div className="card">
          <h3>Low Stock</h3>
          <h2>{lowStock}</h2>
        </div>
        <div className="dashboard-card">
  <h3>Total Inventory Value</h3>
  <p>₹{totalValue.toLocaleString("en-IN")}</p>
</div>
      </div>
      <div className="dashboard-card">
  <h3>Low Stock Products</h3>
  <p>{lowStockCount}</p>
</div>

      <div className="products">
        <h2>Products</h2>
        <input
  type="text"
  placeholder="Search by product name or category..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>    

        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditId(null);
              setForm({
                name: "",
                category: "",
                price: "",
                quantity: "",
                description: "",
              });
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Cancel" : "Add Product"}
        </button>

        {message && <p>{message}</p>}

        {showForm && (
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              placeholder="Product Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />

            <input
              name="price"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />

            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />

            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <button type="submit">
              {editId ? "Update Product" : "Save Product"}
            </button>
          </form>
        )}

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          <div>
            {filteredProducts.map((product) => (
              <div className="card" key={product._id}>
                <h3>{product.name}</h3>
                <p>Category: {product.category}</p>
                <p>Price: ₹{product.price}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Description: {product.description || "N/A"}</p>
{product.quantity < 5 && (
  <p className="low-stock-warning">
    ⚠️ Low Stock
  </p>
)}
                
<select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
>
  <option value="">All Categories</option>
  {[...new Set(products.map((product) => product.category))].map(
    (category) => (
      <option key={category} value={category}>
        {category}
      </option>
    )
  )}
</select>


                <button
                  type="button"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
