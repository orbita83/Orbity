import { useCategoriesViewModel } from "../viewmodel/useCategoriesViewModel";
import { CategoriesScreenContent } from "./categories-content";

/** Tela Categorias (Perfil → Categorias, issue #213): liga a ViewModel à apresentação. */
const CategoriesScreen = () => {
  const [state, actions] = useCategoriesViewModel();

  return <CategoriesScreenContent {...state} {...actions} onReturn={actions.handleReturnToProfile} />;
};

export default CategoriesScreen;
