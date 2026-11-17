import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileHeaderCard } from "./ProfileHeaderCard";

describe("ProfileHeaderCard", () => {
  it("deve renderizar o nome do estudante e sua inicial no avatar", async () => {
    // Act
    await render(<ProfileHeaderCard name="Alex Silva" />);

    // Assert
    expect(screen.getByText("Alex Silva")).toBeTruthy();
    expect(screen.getByText("A", { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText("Estudante")).toBeTruthy();
  });

  it("deve renderizar o estado de esqueleto quando loading for true", async () => {
    // Act
    await render(<ProfileHeaderCard loading={true} />);

    // Assert
    const skeleton = screen.getByLabelText("Carregando identificação do estudante");
    expect(skeleton).toBeTruthy();
    expect(skeleton.props.accessibilityState.busy).toBe(true);
    expect(screen.queryByText("Alex Silva")).toBeNull();
  });

  it("deve disparar onEditPress ao pressionar o botão de edição", async () => {
    // Arrange
    const onEditMock = jest.fn();
    await render(
      <ProfileHeaderCard name="Mariana Costa" onEditPress={onEditMock} />,
    );

    // Act
    const editButton = screen.getByLabelText("Editar nome do perfil");
    expect(editButton.props.accessibilityRole).toBe("button");
    fireEvent.press(editButton);

    // Assert
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });
});
