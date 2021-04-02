const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const courses = require("./myCourses.json");
const { response } = require("express");

//to post you must use bodyParser

app.use(express.static("assets"));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
//follow instruction in http://localhost:8000/

const cal = () => {
  let gpax = courses.courses.map((c) => {
    return {
      GPA : Number(c.gpa)*Number(c.credit),
      Credit : Number(c.credit)
    };
  })
  .reduce((sum , c) => {
    return {
      GPA : c.gpa + sum.gpa,
      Credit : c.credit + sum.credit
    };
  },{gpa : 0, credit : 0});

  console.log(gpax);
  courses.gpax = (gpax.gpa / gpax.credit).toFixed(2);
  console.log(courses.gpax);
}

const writeJSON = () => {
  let db = JSON.stringify(courses, null, 2);
  fs.writeFileSync("myCourses.json", db);
};

const sync = () => {
  cal();
  writeJSON();
};

app.get("/courses", (req,res) => {
  res.json({success: true, data: courses });
});

app.get("/courses/:id", (req, res) => {
  const course = courses.courses.find(
    (course) => course.courseId == req.params.id
  );
  const responseObj = { success: true, data: course };
  if (course != null) {
    res.status(200).json(responseObj);
  } else {
    res.status(404).json({ success: false, data: null });
  }
});

app.delete("/courses/:id", (req, res) => {
  let size = courses.courses.length;
  courses.courses = courses.courses.filter(
    (course) => course.courseId != req.params.id
  );
  if (courses.courses.length < size) {
    sync();
    res.status(200).json({ success: true, data: courses.courses });
  } else {
    res.status(404).json({ success: false, data: courses.courses });
  }
});

app.post("/addCourse", (req, res) => {
  console.log(req.body);
  const { courseId, courseName, credit, gpa } = req.body;
  if (
    courseId !== undefined &&
    courseName !== undefined &&
    credit !== undefined &&
    gpa !== undefined
  ) {
    const newCourse = {
      CourseID: courseId,
      CourseName: courseName,
      Credit: credit,
      GPA: gpa
    };
    courses.courses.push(newCourse);
    sync();
    res.status(201).send({ success: true, data: newCourse });
  } else {
    res.status(422).send({ success: false, error: "ใส่ข้อมูลไม่ครบ" });
  }
});


const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));