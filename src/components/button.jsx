/* eslint-disable react/prop-types */
import { IoAdd, IoPencil, IoTrash } from 'react-icons/io5';

export const ButtonDelete = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 dark:focus:ring-red-800'
    >
      <IoTrash size={16} />
      <span>Delete</span>
    </button>
  );
};

export const ButtonEdit = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-1 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-1.5 dark:focus:ring-green-800'
    >
      <IoPencil size={16} />
      <span>Edit</span>
    </button>
  );
};

export const ButtonAdd = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center mt-2 gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 focus:outline-none'
    >
      <IoAdd size={20} className='text-white' />
      <span>Add Item</span>
    </button>
  );
};
