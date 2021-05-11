import React from "react";
import "./App.css";
import ModalNewField from "./ModalNewField";
import Form from "@rjsf/material-ui";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import Error from "@material-ui/icons/Error";
import Cancel from "@material-ui/icons/Cancel";

import Paper from "@material-ui/core/Paper";
import { Grid, Button } from "@material-ui/core";
import { useJsonSchema } from "./hooks/useJsonSchema";
import { useUiSchema } from "./hooks/useUiSchema";
import { useFields } from "./hooks/useFields";
import newFields from "./schemasJson/newFields.json";
import SaveRoundedIcon from "@material-ui/icons/SaveRounded";
import _rootSchema from "./schemasJson/rootSchema.json";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexGrow: 1,
    marginTop: "50px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left",
    color: theme.palette.text.secondary,
  },
  leftSection: {
    width: "32%",
    marginRight: "20px",
  },
  rightSection: {
    width: "68%",
  },
}));
function App({ getJsonSchemaForm, customWidgets = {} }) {
  const prefix = "question";
  const classes = useStyles();
  const [testTitle, setTestTitle] = React.useState("Survey title");
  const [testDescription, setTestDescription] =
    React.useState("Survey description");

  const [nextQuestionNumber, setNextQuestionNumber] = React.useState(1);

  const getSchemaPropertyNames = (jsonSchema) => {
    let properties = [];

    if (jsonSchema && Object.keys(jsonSchema.properties).length) {
      for (const prop in jsonSchema.properties) {
        properties.push(jsonSchema.properties[prop].id);
      }
    }
    return properties;
  };

  const { jsonSchema, addJsonSchema, updateJsonSchema, analizeFieldsObjects } =
    useJsonSchema(_rootSchema);

  const { uiSchema, addUiSchema, addOrder } = useUiSchema({});
  const { formFields, analizeChangeStructureModalFields } =
    useFields(newFields);
  const [formData, setFormData] = React.useState({});

  const [randomise, setRandomise] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(false);
  const [editDescription, setEditDescription] = React.useState(false);
  const [isFormDisabled, setFormDisabled] = React.useState(false);
  const widgets = {
    ...customWidgets,
  };

  const formChangeHandler = (event) => {
    setFormData(event.formData);
  };

  const addItemForm = (item) => {
    addJsonSchema(item.jsonSchema);
    let result = analizeFieldsObjects();
    analizeChangeStructureModalFields(result);
    addUiSchema(item.uiSchema);
    addOrder(item.jsonSchema.id);
    setNextQuestionNumber(nextQuestionNumber + 1);
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const highLightAnswers = (formData, answers) => {
    let questionIds = Object.keys(formData);

    questionIds.forEach((qId) => {
      let answer = answers[qId] || "block";
      document
        .querySelector(
          `label[for="root_${qId}"] ~ .MuiFormGroup-root span.Mui-checked`
        )
        .classList.add(formData[qId] === answer ? "correct" : "incorrect");

      if (formData[qId] !== answer) {
        // highlight the correct answer
        document
          .querySelector(
            `label[for="root_${qId}"] ~ .MuiFormGroup-root input[value="${answer}"]`
          )
          .parentElement.classList.add("correct");

        let span = document.createElement("span");
        span.setAttribute("class", "error icon");
        span.appendChild(document.createTextNode("Wrong answer!"));
        document
          .querySelector(
            `label[for="root_${qId}"] ~ .MuiFormGroup-root span.Mui-checked`
          )
          .parentElement.after(span);
      }
    });
  };

  const submitHandler = (event) => {
    console.log("submit", event, event.formData);
    setFormDisabled(true);

    let questionId = "609aaeca953824144d1b8bf8";
    fetch(`http://localhost:5001/answerQuestion?id=${questionId}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ formData: event.formData }),
    })
      .then((response) => response.json())
      .then((jsonData) => console.log(jsonData))
      .catch((e) => {
        console.log("error posting data", e);
      });

    // setTimeout(() => {
    //   highLightAnswers(event.formData, {});
    // }, 2000);
  };

  const addQuestionNumbers = (schema) => {
    // add question numbers to title prop
    const schemaWithQuestions = JSON.parse(JSON.stringify(schema));
    let questionTitles = Object.keys(schema.properties);

    let propertyNames = getSchemaPropertyNames(jsonSchema);

    if (randomise) {
      shuffleArray(propertyNames);
      questionTitles = questionTitles.sort((title1, title2) => {
        return propertyNames.indexOf(title1) - propertyNames.indexOf(title2);
      });
    }
    uiSchema["ui:order"] = [...propertyNames, "*"];

    questionTitles.forEach((qTitle, index) => {
      const titleVal = schema.properties[qTitle].title;
      if (titleVal.match(/^[1-9]*\./)) {
        return titleVal;
      }
      schemaWithQuestions.properties[qTitle].title = `Q${
        index + 1
      }. ${titleVal}`;
    });
    return schemaWithQuestions;
  };

  const saveQuestionInDB = (payload) => {
    fetch("http://localhost:5001/createQuestion", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: "tukuna", questionData: payload }),
    })
      .then((response) => response.json())
      .then((jsonData) => console.log(jsonData))
      .catch((e) => {
        console.log("error posting data", e);
      });
  };

  return (
    <div className={classes.root}>
      <Grid
        direction="row"
        className={classes.leftSection}
        justify="center"
        alignItems="center"
        spacing={3}
      >
        <Grid item>
          <Paper className={classes.paper}>
            <ModalNewField
              nextQuestionNumber={nextQuestionNumber}
              formBuilder={formFields}
              addItemForm={addItemForm}
              prefix={prefix}
              onClose={() => {}}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRandomise(true)}
            >
              Randomise
            </Button>
            <Button
              onClick={() => {
                getJsonSchemaForm({ jsonSchema, uiSchema });
                saveQuestionInDB({ jsonSchema, uiSchema });
              }}
              variant="contained"
              color="primary"
            >
              {" "}
              <SaveRoundedIcon />{" "}
            </Button>
            <Grid container direction="column" spacing={2}>
              <Grid item container>
                {editTitle ? (
                  <>
                    <input
                      variant="outlined"
                      className={`${classes.textField} title`}
                      label="Survey title"
                      value={testTitle}
                      onChange={(e) => {
                        jsonSchema.title = e.target.value;
                        updateJsonSchema({ ...jsonSchema });
                        setTestTitle(e.target.value);
                      }}
                    />
                    <Cancel
                      onClick={() => {
                        setEditTitle(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <span className="title">{testTitle}</span>
                    <EditIcon
                      onClick={() => {
                        setEditTitle(true);
                      }}
                    />
                  </>
                )}
              </Grid>
              <Grid item container>
                {editDescription ? (
                  <>
                    <textarea
                      variant="outlined"
                      className={`${classes.textField} title description`}
                      label="Survey description"
                      value={testDescription}
                      onChange={(e) => {
                        jsonSchema.description = e.target.value;
                        updateJsonSchema({ ...jsonSchema });
                        setTestDescription(e.target.value);
                      }}
                    />
                    <Cancel
                      onClick={() => {
                        setEditDescription(false);
                      }}
                    />
                  </>
                ) : (
                  <>
                    <span className="title">{testDescription}</span>
                    <EditIcon
                      onClick={() => {
                        setEditDescription(true);
                      }}
                    />
                  </>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid
        className={classes.rightSection}
        direction="row"
        justify="center"
        alignItems="center"
        spacing={3}
      >
        <Grid item>
          <Paper className={classes.paper}>
            <h2>Preview</h2>
            <Form
              disabled={isFormDisabled}
              showErrorList={false}
              widgets={widgets}
              schema={{ ...addQuestionNumbers(jsonSchema) }}
              formData={formData}
              onChange={formChangeHandler}
              onSubmit={submitHandler}
              uiSchema={uiSchema}
            >
              <div>
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </div>
            </Form>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
