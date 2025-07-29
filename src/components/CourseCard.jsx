import React from "react";

function CourseCard({ course, onInfoClick }) {
  return (
    <div style={{ border: "1px solid #ddd", padding: 16, margin: 16 }}>
      <h3>{course.title}</h3>
    </div>
  );
}

export default CourseCard; 