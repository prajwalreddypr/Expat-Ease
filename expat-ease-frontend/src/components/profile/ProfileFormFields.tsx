import type { ChangeEvent, FC } from 'react';
import type { ProfileFormData } from '../../types/profile';

interface ProfileFormFieldsProps {
  formData: ProfileFormData;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const fieldClassName = 'w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 text-sm sm:text-base';

const ProfileFormFields: FC<ProfileFormFieldsProps> = ({ formData, onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    <div className="sm:col-span-2">
      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
      <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={onChange} className={fieldClassName} />
    </div>
    <div className="sm:col-span-2">
      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
      <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={onChange} placeholder="+33 1 23 45 67 89" className={fieldClassName} />
    </div>
    <div className="sm:col-span-2">
      <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
      <input type="text" id="street_address" name="street_address" value={formData.street_address} onChange={onChange} placeholder="123 Main Street" className={fieldClassName} />
    </div>
    <div>
      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
      <input type="text" id="city" name="city" value={formData.city} onChange={onChange} placeholder="Paris" className={fieldClassName} />
    </div>
    <div>
      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
      <input type="text" id="postal_code" name="postal_code" value={formData.postal_code} onChange={onChange} placeholder="75001" className={fieldClassName} />
    </div>
  </div>
);

export default ProfileFormFields;
