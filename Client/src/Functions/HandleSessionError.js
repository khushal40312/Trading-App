export const handleSessionError = (error, navigate) => {
    if (error?.response?.data?.message?.toLowerCase().includes('session expired')) {
      localStorage.removeItem('token');
      navigate('/session-expired');
    }
  };
  