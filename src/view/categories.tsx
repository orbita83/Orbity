import { ProfilePlaceholderScreen } from "./components/ProfilePlaceholderScreen";
import { useCategoriesViewModel } from "../viewmodel/useCategoriesViewModel";

const CategoriesScreen = () => {
  const [, { handleReturnToProfile }] = useCategoriesViewModel();

  return <ProfilePlaceholderScreen title="Categorias" onReturn={handleReturnToProfile} />;
};

export default CategoriesScreen;
