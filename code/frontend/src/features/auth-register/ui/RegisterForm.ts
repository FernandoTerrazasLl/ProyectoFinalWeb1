import { Block } from "@shared/lib/block/Block";
import type { EventListType } from "@shared/lib/block/EventListType";
import type { RegisterFormProps } from "@features/auth-register/ui/RegisterFormProps";
import type { RegisterFormValues } from "@features/auth-register/lib/RegisterFormValues";
import { validateRegisterForm } from "@features/auth-register/lib/validateRegisterForm";
import registerFormTemplate from "@features/auth-register/ui/RegisterForm.hbs?raw";
import "@features/auth-register/ui/RegisterForm.css";

export class RegisterForm extends Block<RegisterFormProps> {
  protected template = registerFormTemplate;
  protected events: EventListType = {
    input: () => this.toggleSubmit(),
    submit: (event) => {
      event.preventDefault();
      const values = this.readValues();
      this.props.onSubmit({ 
        firstName: values.firstName, 
        lastName: values.lastName, 
        maternalLastName: values.maternalLastName,
        ci: values.ci,
        birthDate: values.birthDate,
        gender: values.gender,
        phoneNumber: values.phoneNumber,
        email: values.email, 
        password: values.password 
      });
    },
  };

  protected componentDidMount() {
    this.toggleSubmit();
  }

  private readValues(): RegisterFormValues {
    return {
      firstName: (this.refs.firstName as HTMLInputElement).value,
      lastName: (this.refs.lastName as HTMLInputElement).value,
      maternalLastName: (this.refs.maternalLastName as HTMLInputElement).value,
      ci: (this.refs.ci as HTMLInputElement).value,
      birthDate: (this.refs.birthDate as HTMLInputElement).value,
      gender: (this.refs.gender as HTMLSelectElement).value,
      phoneNumber: (this.refs.phoneNumber as HTMLInputElement).value,
      email: (this.refs.email as HTMLInputElement).value,
      password: (this.refs.password as HTMLInputElement).value,
      confirmPassword: (this.refs.confirmPassword as HTMLInputElement).value,
    };
  }

  private toggleSubmit() {
    (this.refs.submit as HTMLButtonElement).disabled = !validateRegisterForm(this.readValues());
  }
}
