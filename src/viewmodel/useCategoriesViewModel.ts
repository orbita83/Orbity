import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import { container, resolveUseCase } from "@/di/container";
import {
  CATEGORY_ICON_IDS,
  CATEGORY_NAME_MAX_LENGTH,
  isCategoryIconId,
  type Category,
  type CategoryIconId,
} from "@/model/entities/category";
import { ValidationError } from "@/model/errors";
import type { ICategoryUseCases } from "@/usecase/iCategoryUseCases";

export { CATEGORY_ICON_IDS, CATEGORY_NAME_MAX_LENGTH };

export type CategoriesErrorKey = "error.load" | "error.save";

export type CategoriesState = {
  categories: readonly Category[];
  loading: boolean;
  errorKey: CategoriesErrorKey | null;
  formVisible: boolean;
  editingId: string | null;
  nameInput: string;
  selectedIcon: CategoryIconId;
  nameError: string | null;
  submitting: boolean;
  deletingCategory: Category | null;
};

export type CategoriesActions = {
  /** Volta para Meu perfil, de onde o atalho Categorias abre. */
  handleReturnToProfile: () => void;
  reload: () => Promise<void>;
  openCreate: () => void;
  openEdit: (category: Category, currentLabel?: string) => void;
  closeForm: () => void;
  setNameInput: (value: string) => void;
  selectIcon: (icon: CategoryIconId) => void;
  submitForm: () => Promise<void>;
  requestDelete: (category: Category) => void;
  cancelDelete: () => void;
  confirmDelete: () => Promise<void>;
};

const DEFAULT_ICON: CategoryIconId = CATEGORY_ICON_IDS[6]; // "tag"

/**
 * Estado e ações da tela Categorias (Perfil → Categorias, RF-0020, UC-0015, FL-0015, issue #213).
 * Lista, cria, renomeia, troca o ícone e exclui categorias pelo `ICategoryUseCases`, ou opera em
 * memória quando recebe um array de `Category` (Storybook e testes de apresentação).
 */
export const useCategoriesViewModel = (
  source?: ICategoryUseCases | readonly Category[],
): [CategoriesState, CategoriesActions] => {
  const isPrototypeMode = Array.isArray(source);
  const injectedUseCases = isPrototypeMode ? undefined : (source as ICategoryUseCases | undefined);
  const useCases = resolveUseCase(injectedUseCases, container.useCases.categories);

  const [categories, setCategories] = useState<readonly Category[]>(() =>
    isPrototypeMode ? [...source] : [],
  );
  const [loading, setLoading] = useState<boolean>(!isPrototypeMode);
  const [errorKey, setErrorKey] = useState<CategoriesErrorKey | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInputState] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<CategoryIconId>(DEFAULT_ICON);
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const initialEditLabelRef = useRef<string>("");
  const mountedRef = useRef<boolean>(true);
  const latestRequestRef = useRef<number>(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleReturnToProfile = useCallback(() => {
    router.replace("/profile");
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (isPrototypeMode) {
      return;
    }
    const request = ++latestRequestRef.current;
    const isCurrent = () => mountedRef.current && request === latestRequestRef.current;
    try {
      const loaded = await useCases.listCategories();
      if (isCurrent()) {
        setCategories(loaded);
        setErrorKey(null);
        setLoading(false);
      }
    } catch {
      if (isCurrent()) {
        setErrorKey("error.load");
        setLoading(false);
      }
    }
  }, [isPrototypeMode, useCases]);

  // Recarrega ao ganhar foco e trata o voltar do Android enquanto a tela está em foco.
  useFocusEffect(
    useCallback(() => {
      void reload();
      if (Platform.OS !== "android") return;
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        handleReturnToProfile();
        return true;
      });
      return () => subscription.remove();
    }, [handleReturnToProfile, reload]),
  );

  const openCreate = useCallback(() => {
    initialEditLabelRef.current = "";
    setEditingId(null);
    setNameInputState("");
    setSelectedIcon(DEFAULT_ICON);
    setNameError(null);
    setErrorKey(null);
    setFormVisible(true);
  }, []);

  const openEdit = useCallback((category: Category, currentLabel?: string) => {
    const initialName = currentLabel ?? category.name ?? "";
    initialEditLabelRef.current = initialName;
    setEditingId(category.id);
    setNameInputState(initialName);
    setSelectedIcon(isCategoryIconId(category.icon) ? category.icon : DEFAULT_ICON);
    setNameError(null);
    setErrorKey(null);
    setFormVisible(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormVisible(false);
    setEditingId(null);
    setNameError(null);
    setSubmitting(false);
  }, []);

  const setNameInput = useCallback((value: string) => {
    setNameInputState(value);
    setNameError(null);
  }, []);

  const selectIcon = useCallback((icon: CategoryIconId) => {
    setSelectedIcon(icon);
  }, []);

  const submitForm = useCallback(async (): Promise<void> => {
    if (submitting) {
      return;
    }

    if (isPrototypeMode) {
      if (editingId) {
        setCategories((current) =>
          current.map((item) =>
            item.id === editingId ? { ...item, name: nameInput, icon: selectedIcon } : item,
          ),
        );
      } else {
        const created: Category = Object.freeze({
          id: `custom-${Date.now()}`,
          name: nameInput,
          icon: selectedIcon,
          isDefault: false,
          createdAt: "2026-11-24T10:00:00.000Z",
          updatedAt: "2026-11-24T10:00:00.000Z",
        });
        setCategories((current) => [...current, created]);
      }
      closeForm();
      return;
    }

    setSubmitting(true);
    setNameError(null);
    setErrorKey(null);
    try {
      if (editingId === null) {
        await useCases.createCategory({ name: nameInput, icon: selectedIcon });
      } else {
        const current = categories.find((item) => item.id === editingId);
        const nameChanged =
          nameInput.length === 0 ||
          (current?.name !== undefined
            ? nameInput !== current.name
            : nameInput !== initialEditLabelRef.current);
        const iconChanged = !current || current.icon !== selectedIcon;

        if (nameChanged) {
          await useCases.renameCategory({ id: editingId, name: nameInput });
        }
        if (iconChanged) {
          await useCases.changeCategoryIcon({ id: editingId, icon: selectedIcon });
        }
      }
      const loaded = await useCases.listCategories();
      if (mountedRef.current) {
        setCategories(loaded);
        setSubmitting(false);
        setFormVisible(false);
        setEditingId(null);
      }
    } catch (caught: unknown) {
      if (!mountedRef.current) {
        return;
      }
      setSubmitting(false);
      if (caught instanceof ValidationError) {
        setNameError(caught.message);
      } else {
        setErrorKey("error.save");
      }
    }
  }, [categories, closeForm, editingId, isPrototypeMode, nameInput, selectedIcon, submitting, useCases]);

  const requestDelete = useCallback((category: Category) => {
    setDeletingCategory(category);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeletingCategory(null);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    const target = deletingCategory;
    if (!target) {
      return;
    }
    setDeletingCategory(null);

    if (isPrototypeMode) {
      setCategories((current) => current.filter((item) => item.id !== target.id));
      return;
    }

    setErrorKey(null);
    try {
      await useCases.deleteCategory(target.id);
      const loaded = await useCases.listCategories();
      if (mountedRef.current) {
        setCategories(loaded);
      }
    } catch {
      if (mountedRef.current) {
        setErrorKey("error.save");
      }
    }
  }, [deletingCategory, isPrototypeMode, useCases]);

  return [
    {
      categories,
      loading,
      errorKey,
      formVisible,
      editingId,
      nameInput,
      selectedIcon,
      nameError,
      submitting,
      deletingCategory,
    },
    {
      handleReturnToProfile,
      reload,
      openCreate,
      openEdit,
      closeForm,
      setNameInput,
      selectIcon,
      submitForm,
      requestDelete,
      cancelDelete,
      confirmDelete,
    },
  ];
};
