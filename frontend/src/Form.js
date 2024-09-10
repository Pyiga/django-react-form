// Form.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider
} from '@mui/material';

const Form = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/job-applications/?format=api');
        setSubmissions(response.data);
      } catch (err) {
        setError('An error occurred while fetching data: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewClick = (submission) => {
    setSelectedSubmission(submission);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubmission(null);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        View Submitted Job Applications
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>Last Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Job Positions</TableCell>
              <TableCell>Education</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Resume</TableCell>
              <TableCell>Cover Letters</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>{submission.firstName}</TableCell>
                <TableCell>{submission.lastName}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>{submission.phone}</TableCell>
                <TableCell>
                  {submission.jobPositions ? submission.jobPositions.join(', ') : 'N/A'}
                </TableCell>
                <TableCell>
                  {submission.education && submission.education.length > 0 ? (
                    submission.education.map((edu, index) => (
                      <div key={index}>
                        {edu.institution} - {edu.degree} ({edu.graduationYear})
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {submission.experience && submission.experience.length > 0 ? (
                    submission.experience.map((exp, index) => (
                      <div key={index}>
                        {exp.company} - {exp.position} ({exp.startDate} to {exp.endDate})
                        <p>{exp.responsibilities}</p>
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {submission.resume ? (
                    <a href={`http://127.0.0.1:8000/media/${submission.resume}`} target="_blank" rel="noopener noreferrer">View Resume</a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  {submission.coverLetters && submission.coverLetters.length > 0 ? (
                    submission.coverLetters.map((coverLetter, index) => (
                      <div key={index}>
                        <p>{coverLetter}</p>
                      </div>
                    ))
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleViewClick(submission)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for detailed view */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>Job Application Details</DialogTitle>
        <DialogContent>
          {selectedSubmission && (
            <div>
              <Typography variant="h6">Details for {selectedSubmission.firstName} {selectedSubmission.lastName}</Typography>
              <Divider />
              <Typography variant="body1"><strong>Email:</strong> {selectedSubmission.email}</Typography>
              <Typography variant="body1"><strong>Phone:</strong> {selectedSubmission.phone}</Typography>
              <Typography variant="body1"><strong>Job Positions:</strong> {selectedSubmission.jobPositions ? selectedSubmission.jobPositions.join(', ') : 'N/A'}</Typography>
              <Typography variant="body1"><strong>Education:</strong></Typography>
              {selectedSubmission.education && selectedSubmission.education.length > 0 ? (
                selectedSubmission.education.map((edu, index) => (
                  <div key={index}>
                    {edu.institution} - {edu.degree} ({edu.graduationYear})
                  </div>
                ))
              ) : (
                'N/A'
              )}
              <Typography variant="body1"><strong>Experience:</strong></Typography>
              {selectedSubmission.experience && selectedSubmission.experience.length > 0 ? (
                selectedSubmission.experience.map((exp, index) => (
                  <div key={index}>
                    {exp.company} - {exp.position} ({exp.startDate} to {exp.endDate})
                    <p>{exp.responsibilities}</p>
                  </div>
                ))
              ) : (
                'N/A'
              )}
              <Typography variant="body1"><strong>Resume:</strong></Typography>
              {selectedSubmission.resume ? (
                <a href={`http://127.0.0.1:8000/media/${selectedSubmission.resume}`} target="_blank" rel="noopener noreferrer">View Resume</a>
              ) : (
                'N/A'
              )}
              <Typography variant="body1"><strong>Cover Letters:</strong></Typography>
              {selectedSubmission.coverLetters && selectedSubmission.coverLetters.length > 0 ? (
                selectedSubmission.coverLetters.map((coverLetter, index) => (
                  <div key={index}>
                    <p>{coverLetter}</p>
                  </div>
                ))
              ) : (
                'N/A'
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Form;
