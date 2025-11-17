"use client";
import React, { useState } from "react";

const defaultPermissions = [
  "Create User",
  "Delete User",
  "Edit User",
  "View User",
  "Create Article",
  "Edit Article",
  "Delete Article",
  "Publish Article",
];

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState<
    { name: string; permissions: string[] }[]
  >([]);

  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const createRole = () => {
    if (!roleName.trim()) return;

    const newRole = {
      name: roleName,
      permissions: selectedPermissions,
    };

    setRoles([...roles, newRole]);
    setRoleName("");
    setSelectedPermissions([]);
  };
  

  return (
    <div className="p-8 w-full bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Roles & Permissions</h1>

      {/* Create New Role */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 max-w-xl border">
        <h2 className="text-xl font-medium mb-4">Create New Role</h2>

        <input
          type="text"
          className="w-full border rounded-lg p-2 mb-4"
          placeholder="Enter Role Name (e.g., Editor, Manager)"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />

        <h3 className="text-lg font-medium mb-2">Assign Permissions</h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {defaultPermissions.map((permission) => (
            <label key={permission} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission)}
                onChange={() => handlePermissionToggle(permission)}
              />
              <span>{permission}</span>
            </label>
          ))}
        </div>

        <button
          onClick={createRole}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Create Role
        </button>
         <button
          // onClick={}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Add Permission
        </button>
      </div>

      {/* Existing Roles */}
      <div>
        <h2 className="text-xl font-medium mb-4">Existing Roles</h2>

        <div className="grid gap-4">
          {roles.length === 0 && (
            <p className="text-gray-600">No roles created yet.</p>
          )}

          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow border"
            >
              <h3 className="text-lg font-semibold">{role.name}</h3>
              <p className="mt-2 text-gray-700 font-medium">Permissions:</p>

              <ul className="list-disc ml-6 mt-2 text-gray-900">
                {role.permissions.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolesAndPermissions;
