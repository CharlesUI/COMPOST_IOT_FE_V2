import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  Text,
  FlatList,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderSection from "@/components/HeaderSection";
import { useAdmin } from "@/context/AdminContext";
import { router } from "expo-router";
import { API_URL_BASE } from "@/constants/API_URL";
import { User } from "@/context/UserContext";

// Enum for user roles
enum UserRole {
  USER = "Device Manager",
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { admin } = useAdmin();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState<string | undefined>("");
  const [editedEmail, setEditedEmail] = useState<string | undefined>("");
  const [editedRole, setEditedRole] = useState<UserRole | undefined>(
    UserRole.USER
  );
  const [notificationMessage, setNotificationMessage] = useState<
    string | undefined
  >("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[] | null>([]);

  // Fetch users function
  const fetchUsers = useCallback(async () => {
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
        setFilteredUsers(data.users);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and admin check
  useEffect(() => {
    if (admin) {
      fetchUsers();
    } else {
      router.replace("/adminLog");
    }
  }, [admin, router, fetchUsers]);

  // Search filtering
  useEffect(() => {
    if (users) {
      const filtered = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  // Open user details modal
  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
    setEditedRole(user.title as UserRole);
  };

  // Close user details modal
  const closeUserDetails = () => {
    setIsModalVisible(false);
    setEditMode(false);
    setEditedUsername("");
    setEditedEmail("");
    setNotificationMessage("");
  };

  // Enter edit mode
  const handleEditUser = () => {
    setEditMode(true);
    if (selectedUser) {
      setEditedUsername(selectedUser?.username);
      setEditedEmail(selectedUser?.email);
      setEditedRole(selectedUser?.title as UserRole);
    }
  };

  // Save user changes
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
            role: editedRole,
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
            user._id === selectedUser._id
              ? {
                  ...user,
                  username: editedUsername,
                  email: editedEmail,
                  role: editedRole,
                }
              : user
          )
        );
        setSelectedUser({
          ...selectedUser,
          username: editedUsername,
          email: editedEmail,
          title: editedRole,
        });
        setEditMode(false);
        Alert.alert("Success", "User updated successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to update user");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  // Render user list item
  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => openUserDetails(item)}
      className="bg-[#3A3A3A] p-5 my-2 mx-4 rounded-xl shadow-md border border-[#4A4A4A]"
      style={{ elevation: 3 }}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-bold text-white">{item.username}</Text>
          <Text className="text-gray-400">{item.email}</Text>
          <View className="flex-row items-center">
            <Text
              className={`text-xs ${
                item.title === UserRole.USER ? "text-red-400" : "text-gray-400"
              } mr-2`}
            >
              {item.title?.toUpperCase()}
            </Text>
            {item.devices && item.devices.length > 0 && (
              <View className="flex-row items-center">
                <Ionicons
                  name="phone-portrait-outline"
                  size={14}
                  color="#9CA3AF"
                />
                <Text className="text-gray-400 ml-1 text-xs">
                  {item.devices.length} device
                  {item.devices.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading && !users?.length) {
    return (
      <SafeAreaView className="flex-1 bg-[#242424] items-center justify-center">
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-white mt-4">Loading users...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#242424] items-center justify-center">
        <StatusBar barStyle="light-content" />
        <HeaderSection headerText="Manage Users" title="Admin" />
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text className="text-red-500 mt-2">Error loading users</Text>
        <Text className="text-gray-400 text-center mx-6 mt-2">{error}</Text>
        <TouchableOpacity
          className="bg-[#3A3A3A] px-6 py-3 rounded-lg mt-6"
          onPress={() => router.replace("/AdminDashboard")}
        >
          <Text className="text-white font-semibold">Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#242424]">
      <StatusBar barStyle="light-content" />
      <HeaderSection headerText="Manage Users" title="Admin" />

      {/* Search Bar */}
      <View className="px-4 my-3">
        <View className="bg-[#3A3A3A] rounded-lg px-3 py-2 flex-row items-center border border-[#4A4A4A]">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-2"
            placeholder="Search users by name, email, or role..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* User Count */}
      <View className="px-4 mb-2">
        <Text className="text-gray-400">
          {filteredUsers?.length || 0} user
          {filteredUsers?.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id!}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center p-12">
            <Ionicons name="people-outline" size={64} color="#6B7280" />
            <Text className="text-gray-400 text-center mt-4 text-lg">
              {searchQuery ? "No users match your search." : "No users found."}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                className="mt-4 bg-[#3A3A3A] px-6 py-2 rounded-lg"
                onPress={() => setSearchQuery("")}
              >
                <Text className="text-white">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* User Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeUserDetails}
      >
        <View className="flex-1 justify-end bg-[#00000099]">
          <View className="bg-[#2A2A2A] rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-16 h-1 bg-gray-500 rounded-full mb-4" />

              <View className="w-16 h-16 bg-[#3A3A3A] rounded-full items-center justify-center mb-2">
                <Text className="text-white text-3xl font-bold">
                  {selectedUser?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text className="text-xl font-bold text-white">
                {!editMode ? selectedUser?.username : "Edit User"}
              </Text>
            </View>

            {!editMode ? (
              <View className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="mail-outline"
                    size={22}
                    color="#9CA3AF"
                    className="mr-3"
                  />
                  <Text className="text-white ml-2">{selectedUser?.email}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color="#9CA3AF"
                    className="mr-3"
                  />
                  <Text
                    className={`text-base ${
                      selectedUser?.title === UserRole.USER
                        ? "text-green-400"
                        : "text-white"
                    }`}
                  >
                    {selectedUser?.title?.toUpperCase()}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Ionicons
                    name="phone-portrait-outline"
                    size={22}
                    color="#9CA3AF"
                    className="mr-3"
                  />
                  <Text className="text-white ml-2">
                    {selectedUser?.devices && selectedUser.devices.length > 0
                      ? `${selectedUser.devices.length} device${
                          selectedUser.devices.length !== 1 ? "s" : ""
                        } connected`
                      : "No devices"}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="mb-6">
                <View className="mb-4">
                  <Text className="text-gray-400 mb-1">Username</Text>
                  <TextInput
                    className="bg-[#3A3A3A] text-white px-4 py-3 rounded-lg border border-[#4A4A4A]"
                    placeholder="Username"
                    placeholderTextColor="#777"
                    value={editedUsername}
                    onChangeText={setEditedUsername}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-gray-400 mb-1">Email</Text>
                  <TextInput
                    className="bg-[#3A3A3A] text-white px-4 py-3 rounded-lg border border-[#4A4A4A]"
                    placeholder="Email"
                    placeholderTextColor="#777"
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View>
                  <Text className="text-gray-400 mb-1">User Role</Text>
                  <View className="flex-row justify-between">
                    {Object.values(UserRole).map((role) => (
                      <TouchableOpacity
                        key={role}
                        className={`flex-1 p-3 mx-1 rounded-lg ${
                          editedRole === role
                            ? role === UserRole.USER
                              ? "bg-red-600"
                              : "bg-green-600"
                            : "bg-[#3A3A3A]"
                        }`}
                        onPress={() => setEditedRole(role)}
                      >
                        <Text className="text-white text-center">
                          {role.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {!editMode ? (
              <View className="mb-6">
                <Text className="text-gray-400 mb-1">Send Notification</Text>
                <TextInput
                  className="bg-[#3A3A3A] text-white px-4 py-3 rounded-lg border border-[#4A4A4A] mb-2"
                  placeholder="Type notification message..."
                  placeholderTextColor="#777"
                  value={notificationMessage}
                  onChangeText={setNotificationMessage}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  onPress={async () => {
                    if (!selectedUser || !notificationMessage) return;
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
                          }),
                        }
                      );
                      const data = await response.json();
                      if (data.success) {
                        Alert.alert("Success", "Notification sent successfully");
                        setNotificationMessage("");
                      } else {
                        Alert.alert(
                          "Error",
                          data.message || "Failed to send notification"
                        );
                      }
                    } catch (err: any) {
                      Alert.alert(
                        "Error",
                        err.message || "Failed to send notification"
                      );
                    }
                  }}
                  className={`${
                    !notificationMessage ? "bg-indigo-500/50" : "bg-indigo-500"
                  } p-3 rounded-lg`}
                  disabled={!notificationMessage}
                >
                  <Text className="text-white font-semibold text-center">
                    Send Notification
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View className="flex-row justify-between mb-4">
              {editMode ? (
                <>
                  <TouchableOpacity
                    onPress={() => setEditMode(false)}
                    className="bg-gray-600 p-3 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-white font-semibold text-center">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveUser}
                    className="bg-green-600 p-3 rounded-lg flex-1 ml-2"
                  >
                    <Text className="text-white font-semibold text-center">
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleEditUser}
                    className="bg-blue-600 p-3 rounded-lg flex-1 mr-2"
                  >
                    <Text className="text-white font-semibold text-center">
                      Edit User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
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
                              try {
                                const response = await fetch(
                                  `${API_URL_BASE}/admin/users/${selectedUser._id}`,
                                  {
                                    method: "DELETE",
                                  }
                                );
                                const data = await response.json();
                                if (data.success) {
                                  setUsers((prevUsers: any) =>
                                    prevUsers.filter(
                                      (user: any) =>
                                        user._id !== selectedUser._id
                                    )
                                  );
                                  closeUserDetails();
                                  Alert.alert("Success", "User deleted successfully");
                                } else {
                                  Alert.alert(
                                    "Error",
                                    data.message || "Failed to delete user"
                                  );
                                }
                              } catch (err: any) {
                                Alert.alert(
                                  "Error",
                                  err.message || "Failed to delete user"
                                );
                              }
                            },
                          },
                        ]
                      );
                    }}
                    className="bg-red-600 p-3 rounded-lg flex-1 ml-2"
                  >
                    <Text className="text-white font-semibold text-center">
                      Delete User
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <TouchableOpacity
              onPress={closeUserDetails}
              className="bg-gray-700 p-4 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ManageUsers;