import type { ChangeEvent, FC, RefObject } from 'react';
import type { User } from '../../contexts/auth-context';

interface ProfilePhotoSectionProps {
  user: User | null;
  previewUrl: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPhotoClick: () => void;
  onRemovePhoto: () => void;
}

const ProfilePhotoSection: FC<ProfilePhotoSectionProps> = ({
  user,
  previewUrl,
  fileInputRef,
  onPhotoChange,
  onPhotoClick,
  onRemovePhoto,
}) => (
  <div className="text-center">
    <div className="mb-4">
      <div
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 overflow-hidden"
        onClick={onPhotoClick}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-2xl font-bold">
            {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onPhotoChange}
        className="hidden"
        aria-label="Upload profile photo"
      />
    </div>
    <div className="flex justify-center space-x-3">
      <button
        type="button"
        onClick={onPhotoClick}
        className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        {previewUrl ? 'Change Photo' : 'Upload Photo'}
      </button>
      {previewUrl && (
        <button
          type="button"
          onClick={onRemovePhoto}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      )}
    </div>
  </div>
);

export default ProfilePhotoSection;
