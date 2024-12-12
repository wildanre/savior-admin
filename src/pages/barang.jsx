import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ButtonAdd, ButtonEdit, ButtonDelete } from '../components/button';
import axios from 'axios';

export default function BarangPage() {
  const [barang, setBarang] = useState([]);
  const [tokoList, setTokoList] = useState([]);
  const [newItem, setNewItem] = useState({
    nama: '',
    harga: 0,
    stok: 0,
    tokoId: '',
    imageUrl: '', // image URL from Cloudinary
  });
  const [editingItem, setEditingItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch items from the API using axios
    axios
      .get(`${import.meta.env.VITE_API_URL}/barang`)
      .then((response) => {
        setBarang(response.data);
      })
      .catch((error) => {
        console.error('Error fetching barang:', error);
      });

    axios
      .get(`${import.meta.env.VITE_API_URL}/toko`)
      .then((response) => {
        setTokoList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching toko list:', error);
      });
  }, []);
  // Handle image upload to Cloudinary
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'upload_barang'); // Ganti dengan preset Cloudinary Anda
      formData.append('cloud_name', 'dzev0az08'); // Ganti dengan cloud name Cloudinary Anda

      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dzev0az08/image/upload/',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setNewItem((prevState) => ({
          ...prevState,
          imageUrl: response.data.secure_url, // Menyimpan URL Cloudinary
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  // Create or update item logic (same as before, but use imageUrl from Cloudinary)
  const handleCreate = (e) => {
    e.preventDefault();

    const newItemWithValidData = {
      ...newItem,
      harga: parseInt(newItem.harga),
      stok: parseInt(newItem.stok),
    };

    // Fetch toko data to include in the new item
    const toko = tokoList.find((toko) => toko.id === newItem.tokoId);

    const newItemWithToko = {
      ...newItemWithValidData,
      toko: toko || {},
    };

    setBarang((prevBarang) => [
      ...prevBarang,
      { ...newItemWithToko, id: Date.now() },
    ]);

    axios
      .post(`${import.meta.env.VITE_API_URL}/barang`, newItemWithToko, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const data = response.data;
        setBarang((prevBarang) =>
          prevBarang.map((item) =>
            item.id === newItemWithToko.id ? data : item
          )
        );
        Swal.fire('Success', 'Item added successfully!', 'success');
        setNewItem({
          nama: '',
          harga: 0,
          stok: 0,
          tokoId: '',
          imageUrl: '',
        });
        setIsDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error adding item:', error);
        setBarang((prevBarang) =>
          prevBarang.filter((item) => item.id !== newItemWithToko.id)
        );
        Swal.fire('Error', 'Failed to add item.', 'error');
      });
  };

  // Update item
  const handleUpdate = (e) => {
    e.preventDefault();

    const updatedItem = {
      ...editingItem,
      harga: parseInt(editingItem.harga),
      stok: parseInt(editingItem.stok),
    };

    // Optimistic update
    setBarang((prevBarang) =>
      prevBarang.map((item) =>
        item.id === editingItem.id ? { ...editingItem } : item
      )
    );

    fetch(`${import.meta.env.VITE_API_URL}/barang/${editingItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    })
      .then((response) => response.json())
      .then((data) => {
        setBarang((prevBarang) =>
          prevBarang.map((item) => (item.id === data.id ? data : item))
        );
        Swal.fire('Success', 'Item updated successfully!', 'success');
        setEditingItem(null);
        setIsDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error updating item:', error);
        Swal.fire('Error', 'Failed to update item.', 'error');
        // Rollback
        setBarang((prevBarang) =>
          prevBarang.map((item) =>
            item.id === editingItem.id ? editingItem : item
          )
        );
      });
  };

  // Delete item
  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`${import.meta.env.VITE_API_URL}/barang/${id}`, {
          method: 'DELETE',
        })
          .then(() => {
            setBarang(barang.filter((item) => item.id !== id));
            Swal.fire('Deleted!', 'Your item has been deleted.', 'success');
          })
          .catch((error) => {
            console.error('Error deleting item:', error);
            Swal.fire('Error', 'Failed to delete item.', 'error');
          });
      }
    });
  };
  
  // Form dialog for creating or editing an item
  return (
    <div className='relative overflow-x-auto shadow-md sm:rounded-lg px-5 py-5'>
      {/* Table rendering barang */}
      <table className='w-full text-sm text-left rtl:text-right text-gray-500'>
        <thead className='text-xs uppercase bg-gray-50'>
          <tr>
            <th scope='col' className='px-6 py-3'>
              Item Name
            </th>
            <th scope='col' className='px-6 py-3'>
              Price
            </th>
            <th scope='col' className='px-6 py-3'>
              Stock
            </th>
            <th scope='col' className='px-6 py-3'>
              Nama Toko
            </th>
            <th scope='col' className='px-6 py-3'>
              Gambar
            </th>
            <th scope='col' className='px-6 py-3'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {barang.map((item, index) => (
            <tr className='odd:bg-white even:bg-gray-50 border-b' key={index}>
              <th
                scope='row'
                className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'
              >
                {item.nama}
              </th>
              <td className='px-6 py-4'>{item.harga}</td>
              <td className='px-6 py-4'>{item.stok}</td>
              <td className='px-6 py-4'>
                {item.toko ? item.toko.nama : 'Toko tidak ada'}
              </td>
              <td className='px-6 py-4'>
                <img
                  src={item.imageUrl}
                  alt={item.nama}
                  className='w-10 h-10 object-cover rounded-full'
                />
              </td>
              <td className='px-6 py-4 flex items-center gap-2'>
                <ButtonEdit
                  onClick={() => {
                    setEditingItem(item);
                    setIsDialogOpen(true);
                  }}
                />
                <ButtonDelete onClick={() => handleDelete(item.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ButtonAdd
        onClick={() => {
          setNewItem({
            nama: '',
            harga: 0,
            stok: 0,
            tokoId: '',
            imageUrl: '',
          });
          setEditingItem(null);
          setIsDialogOpen(true);
        }}
      />

      {/* Dialog Form */}
      {isDialogOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-96'>
            <h3 className='text-xl font-semibold mb-4'>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <form onSubmit={editingItem ? handleUpdate : handleCreate}>
              <div className='mb-4'>
                <label className='block text-gray-700'>Item Name</label>
                <input
                  type='text'
                  value={editingItem ? editingItem.nama : newItem.nama}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, nama: e.target.value });
                    } else {
                      setNewItem({ ...newItem, nama: e.target.value });
                    }
                  }}
                  className='mt-1 px-4 py-2 border rounded'
                />
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700'>Price</label>
                <input
                  type='number'
                  value={editingItem ? editingItem.harga : newItem.harga}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, harga: e.target.value });
                    } else {
                      setNewItem({ ...newItem, harga: e.target.value });
                    }
                  }}
                  className='mt-1 px-4 py-2 border rounded'
                  min='0'
                />
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700'>Stock</label>
                <input
                  type='number'
                  value={editingItem ? editingItem.stok : newItem.stok}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, stok: e.target.value });
                    } else {
                      setNewItem({ ...newItem, stok: e.target.value });
                    }
                  }}
                  className='mt-1 px-4 py-2 border rounded'
                  min='0'
                />
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700'>Toko</label>
                <select
                  value={editingItem ? editingItem.tokoId : newItem.tokoId}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({
                        ...editingItem,
                        tokoId: e.target.value,
                      });
                    } else {
                      setNewItem({ ...newItem, tokoId: e.target.value });
                    }
                  }}
                  className='mt-1 px-4 py-2 border rounded'
                >
                  <option value=''>Select Toko</option>
                  {tokoList.map((toko) => (
                    <option key={toko.id} value={toko.id}>
                      {toko.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700'>Upload Image</label>
                <input
                  type='file'
                  onChange={handleImageUpload}
                  className='mt-1 px-4 py-2 border rounded'
                />
                {newItem.imageUrl && (
                  <div className='mt-2'>
                    <img
                      src={newItem.imageUrl}
                      alt='Uploaded'
                      className='w-20 h-20 object-cover'
                    />
                  </div>
                )}
              </div>
              <div className='flex justify-end gap-2'>
                <button
                  type='button'
                  className='bg-gray-500 text-white py-2 px-4 rounded'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='bg-blue-500 text-white py-2 px-4 rounded'
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
