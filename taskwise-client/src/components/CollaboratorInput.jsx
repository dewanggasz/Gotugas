import React, { useState, useRef, useEffect } from 'react';

export default function CollaboratorInput({ allUsers = [], collaborators = [], setCollaborators, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Filter user yang bisa dipilih (belum menjadi kolaborator dan bukan user saat ini)
  const filteredUsers = allUsers.filter(user =>
    user.id !== currentUser?.id &&
    !collaborators.some(c => c.user_id === user.id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk menambahkan kolaborator baru
  const addCollaborator = (user) => {
    // Default izin adalah 'view'
    setCollaborators([...collaborators, { user_id: user.id, name: user.name, permission: 'view' }]);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Fungsi untuk menghapus kolaborator
  const removeCollaborator = (userId) => {
    setCollaborators(collaborators.filter(c => c.user_id !== userId));
  };

  // Fungsi untuk mengubah izin kolaborator
  const updatePermission = (userId, permission) => {
    setCollaborators(collaborators.map(c =>
      c.user_id === userId ? { ...c, permission } : c
    ));
  };

  // Menutup dropdown jika klik di luar komponen
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef}>
      <label className="block text-gray-700 mb-2">Kolaborator</label>
      {/* Daftar kolaborator yang sudah ditambahkan */}
      <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-lg bg-gray-50 min-h-[40px]">
        {collaborators.map(collab => (
          <div key={collab.user_id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-2 text-sm">
            <span>{collab.name}</span>
            {/* Dropdown untuk izin dengan opsi baru */}
            <select
              value={collab.permission}
              onChange={(e) => updatePermission(collab.user_id, e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-blue-800 text-xs"
            >
              <option value="view">Bisa Lihat</option>
              <option value="comment">Bisa Komentar</option>
              <option value="edit">Bisa Edit</option>
            </select>
            <button type="button" onClick={() => removeCollaborator(collab.user_id)} className="font-bold">×</button>
          </div>
        ))}
      </div>

      {/* Input untuk mencari dan menambahkan kolaborator baru */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Tambah kolaborator berdasarkan nama..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isDropdownOpen && filteredUsers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => addCollaborator(user)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
