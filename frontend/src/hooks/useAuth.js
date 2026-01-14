import { useQuery, useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await authAPI.me();
      return response.data.user;
    },
    enabled: !!token && !user,
    onSuccess: (data) => {
      useAuthStore.setState({ user: data });
    },
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (response) => {
      const { token, user } = response.data;
      setAuth(user, token);
      
      if (!user.isOnboarded) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (response) => {
      const { token, user } = response.data;
      setAuth(user, token);
      navigate('/onboarding');
    },
  });

  const logout = () => {
    storeLogout();
    navigate('/');
  };

  return {
    user: user || currentUser,
    isAuthenticated,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}