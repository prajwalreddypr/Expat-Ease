import type { FC } from 'react';
import type { User } from '../../contexts/auth-context';

interface AccountInformationProps {
  user: User | null;
}

const AccountInformation: FC<AccountInformationProps> = ({ user }) => (
  <div className="border-t border-gray-200 pt-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {user?.is_demo ? 'Account Type' : 'Email Address'}
        </label>
        <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
          {user?.is_demo ? 'Temporary demo account' : user?.email || 'Not specified'}
        </div>
        {user?.is_demo && (
          <p className="mt-1.5 text-sm text-gray-500">
            No email is connected to this temporary session.
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country of Origin</label>
        <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
          {user?.country || 'Not specified'}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Country</label>
        <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
          {user?.settlement_country || 'Not selected'}
        </div>
      </div>
    </div>
  </div>
);

export default AccountInformation;
