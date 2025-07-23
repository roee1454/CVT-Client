import { axiosClient } from "@/lib/axios";
import { User, UserLogin, UserRegister } from "@/types";
import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: User | null;
  login: (userData: UserLogin) => Promise<void>;
  logout: () => void;
  register: (userData: UserRegister) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const context = createContext<AuthContextProps | undefined>(undefined);

const fetchUser = async (): Promise<User> => {
  const response = await axiosClient.get("/auth/me");
  return response.data;
};

export function UserProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, error, refetch } = useQuery<User, Error>(
    {
        queryKey: ["user"],
        queryFn: fetchUser,
        retry: false
    }
  );

  const { mutateAsync: register } = useMutation(
    {
        mutationFn: async (userData: UserRegister) => {
            await axiosClient.post("/auth/register", userData);
        },
        onError: (error) => {
            console.error(error);
        },
        onSuccess: () => {
            refetch()
        }
    }
  );

  const { mutateAsync: login } = useMutation(    
    {
        mutationFn: async (userData: UserLogin) => {
            const response = await axiosClient.post("/auth/login", userData);
            return response.data;
        },
        onError: (err) => {
            console.error(err);
        },
        onSuccess: () => {
            refetch()
        }
    }
  );

  const logout = () => {
    axiosClient.get("/auth/logout", { withCredentials: true }).then(() => {
      queryClient.removeQueries({ queryKey: ['user'] });
      refetch();
    });
  };

  return (
    <context.Provider
      value={{
        user: user ?? null,
        login,
        logout,
        register,
        isLoading,
        error: isError ? error : null,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useAuth() {
  const contextValue = useContext(context);
  if (!contextValue) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return contextValue;
}

export function AdminProtectedRoute({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    if (!user || user.role === "user") navigate("/")
    return children;
}