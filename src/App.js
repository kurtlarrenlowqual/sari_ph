import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

export default function App() {
  const [products, setProducts] = useState([
    { id: 1, name: "Notebook", price: 50, stock: 120, status: "Active" },
    { id: 2, name: "Ballpen", price: 10, stock: 300, status: "Active" }
  ]);

  // --- UPDATED FUNCTION ---
  const addProduct = (newProduct) => {
    const nextId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;

    setProducts([...products, { ...newProduct, id: nextId }]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <BrowserRouter>
      <AppRoutes 
        products={products} 
        onAdd={addProduct} 
        onUpdate={updateProduct} 
        onDelete={deleteProduct} 
      />
    </BrowserRouter>
  );
}