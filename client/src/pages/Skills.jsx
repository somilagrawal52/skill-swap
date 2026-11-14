import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import { createSkill, getAllSkills } from "../services/api";
import { Link } from "react-router-dom";

const Skills = () => {
  const { user } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchSkills = async () => {
    const { data } = await getAllSkills();
    setSkills(data);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;
    await createSkill(title, description);
    setTitle(""); setDescription("");
    fetchSkills();
  };

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Link to="/">Back to dashboard</Link>
      <h2>Add a Skill</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Skill title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Add Skill</button>
      </form>

      <h2>All Skills</h2>
      <ul>
        {skills.map(skill => (
  <li key={skill._id}>
    <strong>{skill.title}</strong> by {skill.userId.name} <br />
    {skill.description} <br />
  </li>
))}
      </ul>
    </div>
  );
};

export default Skills;
