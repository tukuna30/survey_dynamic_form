import React from "react";
import Form from "@rjsf/material-ui";
import WrapperModal from "./WrapperModal";
import AddRoundedIcon from "@material-ui/icons/AddRounded";

export const handleSubmitModalNewField = (formData, prefix) => {
  const newProp = { jsonSchema: {}, uiSchema: {} };

  newProp.jsonSchema.title = formData.title;
  formData.id = `${prefix}_${Date.now()}_id`;

  newProp.jsonSchema.id = formData.id;
  if (typeof formData.description != "undefined") {
    newProp.uiSchema[formData.id] = { "ui:help": formData.description };
  }

  if (formData.required) {
    newProp.jsonSchema.isRequired = formData.required;
  }

  switch (formData.fieldType) {
    case "Input":
      newProp.jsonSchema.type = "string";
      break;
    case "Select":
      newProp.jsonSchema.type = "string";
      newProp.jsonSchema.enum = formData.options;
      let beforeObject = newProp.uiSchema[formData.id];
      newProp.uiSchema[formData.id] = {
        ...beforeObject,
        ...{ "ui:widget": "select" },
      };
      break;

    case "RadioGroup":
      newProp.jsonSchema.type = "string";
      newProp.jsonSchema.enum = formData.options;
      newProp.jsonSchema.enumNames = [...formData.options];

      let _beforeObject = newProp.uiSchema[formData.id];
      newProp.uiSchema[formData.id] = {
        ..._beforeObject,
        ...{ "ui:widget": "radio" },
      };
      break;
    case "CheckBox":
      newProp.jsonSchema.type = "boolean";
      break;
    case "Radio buttons":
      newProp.jsonSchema.type = "boolean";
      let beforeObjectRadio = newProp.uiSchema[formData.id];
      newProp.uiSchema[formData.id] = {
        ...beforeObjectRadio,
        ...{ "ui:widget": "radio" },
      };
      break;
    case "Date":
      newProp.jsonSchema.type = "string";
      newProp.jsonSchema.format = "date";
      break;

    default:
      break;
  }

  if (formData.sections) {
    newProp.jsonSchema.sections = formData.sections;
  }

  return newProp;
};

export default function ModalNewField({
  formBuilder,
  addItemForm,
  prefix = "",
  onClose,
  nextQuestionNumber,
}) {
  const onSubmit = ({ formData }, e) => {
    const newProp = handleSubmitModalNewField(formData, prefix);
    addItemForm(newProp);
  };

  return (
    <WrapperModal txtBtn={<AddRoundedIcon />} txtTitle="" onClose={onClose}>
      <div>Q{nextQuestionNumber}</div>
      <Form schema={formBuilder} onSubmit={onSubmit}>
        <div>
          <button
            className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary"
            type="submit"
          >
            {" "}
            {"Add"}
          </button>
        </div>
      </Form>
    </WrapperModal>
  );
}
