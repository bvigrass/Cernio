interface PasswordStrengthCheckerProps {
  password: string;
  confirmPassword: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function PasswordStrengthChecker({
  password,
  confirmPassword,
}: PasswordStrengthCheckerProps) {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /[0-9]/.test(password),
    },
    {
      label: 'Contains special character (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
    {
      label: 'Passwords match',
      met: password.length > 0 && confirmPassword.length > 0 && password === confirmPassword,
    },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  const allMet = metCount === requirements.length;

  return (
    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">Password Strength</p>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < metCount
                    ? metCount <= 2
                      ? 'bg-red-500'
                      : metCount <= 4
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span
            className={`text-xs font-medium ${
              metCount <= 2
                ? 'text-red-600'
                : metCount <= 4
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}
          >
            {metCount === 0 ? 'Very Weak' : metCount <= 2 ? 'Weak' : metCount <= 4 ? 'Good' : 'Strong'}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`flex-shrink-0 h-4 w-4 rounded-sm border transition-colors ${
                requirement.met
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {requirement.met && (
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-sm ${
                requirement.met ? 'text-green-700 font-medium' : 'text-gray-600'
              }`}
            >
              {requirement.label}
            </span>
          </div>
        ))}
      </div>

      {allMet && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700 flex items-center">
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Your password meets all requirements!
          </p>
        </div>
      )}
    </div>
  );
}
