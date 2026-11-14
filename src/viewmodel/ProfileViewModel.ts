import { useCallback, useEffect, useState } from "react";
import { container, resolveUseCase } from "@/DI/container";
import type { StudentProfile } from "@/model/entities/student-profile";
import { DomainError, ValidationError } from "@/model/errors/domain-error";
import type { IProfileUseCases } from "@/usecase/profile-use-cases";

/**
 * Representação do estado observável da tela de Perfil.
 */
export type ProfileState = {
  readonly profile: StudentProfile | null;
  readonly loading: boolean;
  readonly saving: boolean;
  readonly error: string | null;
  readonly validationError: string | null;
  readonly isEditingName: boolean;
  readonly nameInput: string;
};

/**
 * Ações disparadas pela interface de usuário na tela de Perfil.
 */
export type ProfileActions = {
  readonly loadProfile: () => Promise<void>;
  readonly openEditNameModal: () => void;
  readonly closeEditNameModal: () => void;
  readonly setNameInput: (name: string) => void;
  readonly saveName: () => Promise<boolean>;
  readonly clearError: () => void;
};

/**
 * Hook de apresentação da tela Meu perfil, responsável por gerenciar estados de
 * identificação, carregamento, erros e o fluxo de edição do nome do estudante.
 */
export function useProfileViewModel(
  overrideUseCase?: IProfileUseCases,
): ProfileState & ProfileActions {
  const useCase = resolveUseCase(overrideUseCase, container.useCases.profile);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  const loadProfile = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await useCase.getProfile();
      setProfile(data);
    } catch (err: unknown) {
      setError(
        err instanceof DomainError
          ? err.message
          : "Não foi possível carregar os dados do perfil.",
      );
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  useEffect(() => {
    let isMounted = true;

    const fetchInitialProfile = async (): Promise<void> => {
      try {
        const data = await useCase.getProfile();
        if (isMounted) {
          setProfile(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof DomainError
              ? err.message
              : "Não foi possível carregar os dados do perfil.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialProfile();

    return () => {
      isMounted = false;
    };
  }, [useCase]);

  const openEditNameModal = useCallback((): void => {
    setNameInput(profile?.name ?? "");
    setValidationError(null);
    setIsEditingName(true);
  }, [profile?.name]);

  const closeEditNameModal = useCallback((): void => {
    setIsEditingName(false);
    setValidationError(null);
  }, []);

  const handleSetNameInput = useCallback((value: string): void => {
    setNameInput(value);
    setValidationError(null);
  }, []);

  const saveName = useCallback(async (): Promise<boolean> => {
    setSaving(true);
    setValidationError(null);
    try {
      const updated = await useCase.updateName(nameInput);
      setProfile(updated);
      setIsEditingName(false);
      return true;
    } catch (err: unknown) {
      if (err instanceof ValidationError) {
        setValidationError(err.message);
      } else if (err instanceof DomainError) {
        setError(err.message);
      } else {
        setError("Não foi possível atualizar o nome do perfil.");
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [nameInput, useCase]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    profile,
    loading,
    saving,
    error,
    validationError,
    isEditingName,
    nameInput,
    loadProfile,
    openEditNameModal,
    closeEditNameModal,
    setNameInput: handleSetNameInput,
    saveName,
    clearError,
  };
}
