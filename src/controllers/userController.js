const { User, Course, Enrollment } = require("../models");
const { validationResult } = require("express-validator");

const userController = {
  showProfile: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/auth/login");
      }

      const userId = req.session.user.id;

      const user = await User.findByPk(userId, {
        attributes: [
          "id",
          "name",
          "email",
          "role",
          "profile_picture",
          "created_at",
        ],
      });

      if (!user) {
        return res.redirect("/auth/login");
      }

      const enrolledCourses = await Course.findAll({
        include: [
          {
            model: Enrollment,
            as: "enrollments",
            where: { user_id: userId },
            attributes: ["id", "user_id", "course_id", "created_at"],
          },
        ],
        order: [["enrollments", "created_at", "DESC"]],
      });

      // Format the data for the view
      const formattedCourses = enrolledCourses.map((course) => {
        const courseData = course.toJSON();
        courseData.enrollment_date = courseData.enrollments[0].created_at;
        delete courseData.enrollments;
        return courseData;
      });

      res.render("profile", {
        title: "LearnHub | My Profile",
        user: user.toJSON(),
        enrolledCourses: formattedCourses,
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      res.status(500).render("error", {
        title: "Error",
        error: {
          status: 500,
          message: "Unable to load profile information",
        },
        user: req.session.user,
      });
    }
  },

  enrollCourse: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/auth/login");
      }

      const userId = req.session.user.id;
      const courseId = req.params.courseId;

      // Check if course exists
      const course = await Course.findByPk(courseId);

      if (!course) {
        return res.status(404).render("error", {
          title: "LearnHub | Course Not Found",
          error: {
            status: 404,
            message: "The course you're trying to enroll in doesn't exist",
          },
          user: req.session.user,
        });
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: courseId,
        },
        attributes: ["id", "user_id", "course_id", "created_at"],
      });

      if (existingEnrollment) {
        return res.redirect("/courses");
      }

      // Enroll user
      await Enrollment.create({
        user_id: userId,
        course_id: courseId,
      });

      res.redirect("/courses");
    } catch (err) {
      console.error("Error enrolling in course:", err);
      res.status(500).render("error", {
        title: "LearnHub | Enrollment Error",
        error: {
          status: 500,
          message: "Failed to enroll in course",
        },
        user: req.session.user,
      });
    }
  },

  unenrollCourse: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect("/auth/login");
      }

      const userId = req.session.user.id;
      const courseId = req.params.courseId;

      await Enrollment.destroy({
        where: {
          user_id: userId,
          course_id: courseId,
        },
      });

      // Check if request came from profile page
      const referer = req.get("Referer");
      if (referer && referer.includes("/profile")) {
        res.redirect("/user/profile");
      } else {
        res.redirect("/courses");
      }
    } catch (err) {
      console.error("Error unenrolling from course:", err);
      res.status(500).render("error", {
        title: "LearnHub | Unenrollment Error",
        error: {
          status: 500,
          message: "Failed to unenroll from course",
        },
        user: req.session.user,
      });
    }
  },
};

module.exports = userController;
