import React, { useState, useEffect } from "react";
import AdminNavBar from "./AdminNavBar";
import QuestionForm from "./QuestionForm";
import QuestionList from "./QuestionList";

function App() {
  const [page, setPage] = useState("List");
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = () => {
    fetch("http://localhost:4000/questions")
      .then((r) => r.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error("Error fetching questions:", error));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAddQuestion = (questionData) => {
    const formattedQuestion = {
      prompt: questionData.prompt,
      answers: [
        questionData.answer1,
        questionData.answer2,
        questionData.answer3,
        questionData.answer4,
      ],
      correctIndex: parseInt(questionData.correctIndex),
    };

    fetch("http://localhost:4000/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedQuestion),
    })
      .then((r) => r.json())
      .then((newQuestion) => {
        setQuestions([...questions, newQuestion]);
        setPage("List");
      })
      .catch((error) => console.error("Error adding question:", error));
  };

  const handleDeleteQuestion = (id) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setQuestions(questions.filter((q) => q.id !== id));
      })
      .catch((error) => console.error("Error deleting question:", error));
  };

  const handleUpdateAnswer = (id, correctIndex) => {
    // Update state optimistically
    const parsedIndex = parseInt(correctIndex);
    setQuestions(
      questions.map((q) => 
        q.id === id ? { ...q, correctIndex: parsedIndex } : q
      )
    );

    // Then update the server
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correctIndex: parsedIndex }),
    })
      .then((r) => r.json())
      .then((updatedQuestion) => {
        // If there's a server-side change we didn't anticipate, this will sync it
        setQuestions(
          questions.map((q) => (q.id === id ? updatedQuestion : q))
        );
      })
      .catch((error) => {
        console.error("Error updating question:", error);
        // On error, revert to original state
        fetchQuestions();
      });
  };

  return (
    <main>
      <AdminNavBar onChangePage={setPage} />
      {page === "Form" ? (
        <QuestionForm onAddQuestion={handleAddQuestion} />
      ) : (
        <QuestionList
          questions={questions}
          onDeleteQuestion={handleDeleteQuestion}
          onUpdateAnswer={handleUpdateAnswer}
        />
      )}
    </main>
  );
}

export default App;
