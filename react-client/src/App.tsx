import React, { FormEvent } from "react";

function App() {
  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const formData = new FormData(evt.currentTarget);

    try {
      const response = await fetch("http://localhost:8000/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      console.log(result);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="login">Login</label>
        <input type="text" name="login" id="login" />
        <br />
        <input type="file" name="avatar" />
        <br />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
