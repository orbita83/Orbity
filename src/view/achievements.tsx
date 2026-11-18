import { ProfilePlaceholderScreen } from "./components/ProfilePlaceholderScreen";
import { useAchievementsViewModel } from "../viewmodel/useAchievementsViewModel";

const AchievementsScreen = () => {
  const [, { handleReturnToProfile }] = useAchievementsViewModel();

  return <ProfilePlaceholderScreen title="Conquistas" onReturn={handleReturnToProfile} />;
};

export default AchievementsScreen;
