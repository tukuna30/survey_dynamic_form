import React, { useState } from "react";

export const useUiSchema = (rootSchemaUi = {}) => {
  const [uiSchema, setUiSchema] = useState(rootSchemaUi);

  const addUiSchema = (item) => {
    if (item && Object.keys(item).length) {
      setUiSchema((beforeState) => ({ ...beforeState, ...item }));
    }
  };

  const addOrder = (id) => {
    if (uiSchema["ui:order"]) {
      const newUiSchema = { ...uiSchema };
      newUiSchema["ui:order"] = newUiSchema["ui:order"].filter((x) => x != "*");
      newUiSchema["ui:order"].push(id);
      newUiSchema["ui:order"].push("*");
      setUiSchema((beforeState) => ({ ...beforeState, ...newUiSchema }));
    }
  };

  const updateUiSchema = (idsToKeep) => {
    const filteredUisSchema = deleteUiSchemas(idsToKeep);
    idsToKeep.push("*");
    const newUiSchema = { ...filteredUisSchema };
    newUiSchema["ui:order"] = idsToKeep;
    setUiSchema(newUiSchema);
  };

  const deleteUiSchemas = (idsToKeep) => {
    var All_ids = [];
    for (const prop in uiSchema) {
      All_ids.push(prop);
    }

    var idsToDelete = All_ids.filter((x) => {
      return idsToKeep.indexOf(x) === -1;
    });

    var newJsonSchema = { ...uiSchema };
    idsToDelete.forEach((prop) => {
      delete newJsonSchema[prop];
    });
    return newJsonSchema;
  };

  return { uiSchema, addUiSchema, updateUiSchema, addOrder };
};
