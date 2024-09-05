import { ModelProperty } from "@typespec/compiler";

export interface ConstructorMemberProps {
  type: ModelProperty;
}

/**
 * Instantiate class member via constructor
 */
export function ConstructorMember({ type }: ConstructorMemberProps) {
  return (
    <>
      this.{type.name} = {type.name};
    </>
  );
}
