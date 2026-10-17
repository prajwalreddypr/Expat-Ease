import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { updateProfile, uploadProfilePhoto } from '../api/profile';
import type { User } from '../contexts/auth-context';
import type { ProfileFormData, ProfileMessage } from '../types/profile';

const emptyProfile: ProfileFormData = {
  full_name: '',
  street_address: '',
  city: '',
  postal_code: '',
  phone_number: '',
};

interface UseProfileFormOptions {
  user: User | null;
  token: string | null;
  refreshUser: () => Promise<void>;
}

export const useProfileForm = ({ user, token, refreshUser }: UseProfileFormOptions) => {
  const [formData, setFormData] = useState<ProfileFormData>(emptyProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<ProfileMessage | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.profile_photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setFormData({
      full_name: user.full_name || '',
      street_address: user.street_address || '',
      city: user.city || '',
      postal_code: user.postal_code || '',
      phone_number: user.phone_number || '',
    });
  }, [user]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMessage(null);
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setMessage(null);
    try {
      let profilePhotoUrl = user?.profile_photo || null;
      if (profilePhoto) {
        const updatedUser = await uploadProfilePhoto(token, profilePhoto);
        profilePhotoUrl = updatedUser.profile_photo;
      }
      await updateProfile(token, formData, profilePhotoUrl);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await refreshUser();
      setProfilePhoto(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      document.getElementById('profile-modal-container')?.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    message,
    previewUrl,
    fileInputRef,
    handleChange,
    handlePhotoChange,
    handlePhotoClick,
    handleRemovePhoto,
    handleSubmit,
  };
};
