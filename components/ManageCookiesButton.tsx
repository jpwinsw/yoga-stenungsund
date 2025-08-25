'use client';


interface ManageCookiesButtonProps {
  label: string;
  className?: string;
}

export default function ManageCookiesButton({ label, className = "" }: ManageCookiesButtonProps) {

  const handleManageCookies = () => {
    // Clear consent to trigger banner again
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_timestamp');
    // Reload the page to show the banner
    window.location.reload();
  };

  return (
    <button
      onClick={handleManageCookies}
      className={className || "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"}
    >
      {label}
    </button>
  );
}