import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import HeaderSection from "@/components/HeaderSection";
import { useAdmin } from "@/context/AdminContext";
import { router } from "expo-router";
import { API_URL_BASE } from "@/constants/API_URL";
import { useToast } from "react-native-toast-notifications"; // For displaying notifications
import { User } from "@/context/UserContext";

const ManageUsers = () => {
  const [users, setUsers] = useState<User[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { admin } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState<string | undefined>("");
  const [editedEmail, setEditedEmail] = useState<string | undefined>("");
  const [notificationMessage, setNotificationMessage] = useState<string | undefined>("");
  const toast = useToast();
  // const [notificationMessage, setNotificationMessage] = useState("");
  // Optional: State to manage notification level
  const [selectedNotificationLevel, setSelectedNotificationLevel] = useState("info");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL_BASE}/admin/users`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch users: ${response.status} - ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchUsers();
    } else {
      router.replace("/adminLog");
    }
  }, [admin, router]);

  const openUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const closeUserDetails = () => {
    setIsModalVisible(false);
    setEditMode(false);
    setEditedUsername("");
    setEditedEmail("");
    setNotificationMessage("");
  };

  const handleEditUser = () => {
    setEditMode(true);
    if(selectedUser) {

      setEditedUsername(selectedUser?.username);
      setEditedEmail(selectedUser?.email);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL_BASE}/admin/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: editedUsername,
            email: editedEmail,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to update user");
      }
      const data = await response.json();
      if (data.success) {
        // Update the users list locally
        setUsers((prevUsers: any) =>
          prevUsers.map((user: any) =>
            user._id === selectedUser._id ? { ...user, username: editedUsername, email: editedEmail } : user
          )
        );
        setSelectedUser({ ...selectedUser, username: editedUsername, email: editedEmail });
        setEditMode(false);
        toast.show("User updated successfully", { type: "success" });
      } else {
        toast.show(data.message || "Failed to update user", { type: "danger" });
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to update user", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationMessage) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL_BASE}/admin/users/${selectedUser._id}/notify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: notificationMessage,
            // Optional: Include the level if you added the UI
            // level: selectedNotificationLevel,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || "Failed to send notification");
      }
      const data = await response.json();
      if (data.success) {
        toast.show("Notification sent successfully", { type: "success" });
        setNotificationMessage("");
        // Optional: Reset the level state
        // setSelectedNotificationLevel("info");
      } else {
        toast.show(data.message || "Failed to send notification", { type: "danger" });
      }
    } catch (err: any) {
      toast.show(err.message || "Failed to send notification", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete user: ${selectedUser.username}? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `${API_URL_BASE}/admin/users/${selectedUser._id}`,
                {
                  method: "DELETE",
                }
              );
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Failed to delete user");
              }
              const data = await response.json();
              if (data.success) {
                setUsers((prevUsers: any) =>
                  prevUsers.filter((user: any) => user._id !== selectedUser._id)
                );
                closeUserDetails();
                toast.show("User deleted successfully", { type: "success" });
              } else {
                toast.show(data.message || "Failed to delete user", { type: "danger" });
              }
            } catch (err: any) {
              toast.show(err.message || "Failed to delete user", { type: "danger" });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => openUserDetails(item)}
      className="bg-[#434040] p-4 my-2 mx-4 rounded-md"
    >
      <Text className="text-lg font-bold text-white">{item.username}</Text>
      <Text className="text-gray-400">{item.email}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#2F2C2C] items-center justify-center">
        <HeaderSection headerText="Manage Users" title="Admin" />
        <Text className="text-white">Loading users...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#2F2C2C] items-center justify-center">
        <HeaderSection headerText="Manage Users" title="Admin" />
        <Text className="text-red-500">Error loading users: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#2F2C2C]">
      <HeaderSection headerText="Manage Users" title="Admin" />
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item._id!}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-6">
            <Text className="text-gray-600">No users found.</Text>
          </View>
        )}
      />

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeUserDetails}
      >
        <View className="flex-1 justify-center items-center bg-[#00000080]">
          <View className="bg-[#333333] rounded-md p-6 w-5/6">
            <Text className="text-xl font-bold text-white mb-4">
              {selectedUser?.username} Details
            </Text>
            <Text className="text-white mb-2">Email: {selectedUser?.email}</Text>
            <Text className="text-white mb-2">
              Devices: {selectedUser?.devices ? selectedUser.devices.join(", ") : "No devices"}
            </Text>

            {editMode ? (
              <View>
                <TextInput
                  className="bg-[#444444] text-white p-2 rounded-md mb-2"
                  placeholder="Username"
                  placeholderTextColor="#777"
                  value={editedUsername}
                  onChangeText={setEditedUsername}
                />
                <TextInput
                  className="bg-[#444444] text-white p-2 rounded-md mb-2"
                  placeholder="Email"
                  placeholderTextColor="#777"
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                />
                <TouchableOpacity onPress={handleSaveUser} className="bg-green-500 p-3 rounded-md mt-2">
                  <Text className="text-white font-bold text-center">Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleEditUser} className="bg-blue-500 p-3 rounded-md mt-2">
                <Text className="text-white font-bold text-center">Edit</Text>
              </TouchableOpacity>
            )}

            <TextInput
              className="bg-[#444444] text-white p-2 rounded-md mt-4 mb-2"
              placeholder="Notification Message"
              placeholderTextColor="#777"
              value={notificationMessage}
              onChangeText={setNotificationMessage}
              multiline
            />
            <TouchableOpacity onPress={handleSendNotification} className="bg-purple-500 p-3 rounded-md mb-2">
              <Text className="text-white font-bold text-center">Send Notification</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteUser} className="bg-red-500 p-3 rounded-md mt-4">
              <Text className="text-white font-bold text-center">Delete User</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={closeUserDetails} className="bg-gray-500 p-3 rounded-md mt-2">
              <Text className="text-white font-bold text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageUsers;