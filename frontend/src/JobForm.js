import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Container, TextField, Button, IconButton } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Styles
const FormContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#fff',
  width: '80%',
  margin: 'auto',
  border: '8px solid #0000ff',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const FormGroup = styled('div')(({ theme }) => ({
  width: '80%',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const FieldRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  borderRadius: '8px',
  '& .MuiInputLabel-root': {
    color: '#000',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#000',
    },
    '&:hover fieldset': {
      borderColor: '#000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000',
    },
  },
}));

const WideTextArea = styled(TextField)(({ theme }) => ({
  borderRadius: '8px',
  width: '100%',
  height: '200px',  // Increase height for cover letter
  '& .MuiInputLabel-root': {
    color: '#000',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#000',
    },
    '&:hover fieldset': {
      borderColor: '#000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#000',
    },
  },
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  backgroundColor: '#0000ff',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#0000cc',
  },
  display: 'flex',
  alignItems: 'center',
}));

const Title = styled('h2')(({ theme }) => ({
  color: '#000',
}));

const Subheading = styled('h3')(({ theme }) => ({
  color: '#000',
}));

const ErrorText = styled('p')(({ theme }) => ({
  color: 'red',
  fontSize: '0.875rem',
}));

// Validation schema
const schema = yup.object().shape({
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  otherName: yup.string().when('includeOtherName', {
    is: true,
    then: yup.string().required('Other Name is required'),
    otherwise: yup.string().notRequired(),
  }),
  includeOtherName: yup.boolean(),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^[0-9]+$/, 'Phone number is not valid').required('Phone number is required'),
  education: yup.array().of(
    yup.object().shape({
      institution: yup.string().required('Institution is required'),
      degree: yup.string().required('Degree is required'),
      graduationYear: yup.number().required('Graduation year is required').min(1900, 'Invalid year').max(new Date().getFullYear(), 'Invalid year'),
    })
  ).min(1, 'At least one education entry is required'),
  experience: yup.array().of(
    yup.object().shape({
      company: yup.string().required('Company is required'),
      position: yup.string().required('Position is required'),
      startDate: yup.date().required('Start date is required'),
      endDate: yup.date().required('End date is required').min(yup.ref('startDate'), 'End date must be after start date'),
      responsibilities: yup.string().required('Responsibilities are required'),
    })
  ).min(1, 'At least one work experience entry is required'),
  jobPositions: yup.array().of(yup.string().required('Job position cannot be empty')).min(1, 'At least one job position is required'),
  resume: yup.mixed().required('Resume is required').test('fileType', 'Only .doc and .pdf files are allowed', (value) => {
    return value && (value[0]?.type === 'application/pdf' || value[0]?.type === 'application/msword');
  }),
  coverLetters: yup.array().of(yup.string().required('Cover letter cannot be empty')).min(1, 'At least one cover letter is required'),
});

const JobForm = () => {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      otherName: '',
      includeOtherName: false,
      email: '',
      phone: '',
      education: [{ institution: '', degree: '', graduationYear: '' }],
      experience: [{ company: '', position: '', startDate: '', endDate: '', responsibilities: '' }],
      jobPositions: [''],
      resume: null,
      coverLetters: [''],
    }
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: 'education'
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: 'experience'
  });

  const { fields: jobPositionFields, append: appendJobPosition, remove: removeJobPosition } = useFieldArray({
    control,
    name: 'jobPositions'
  });

  const { fields: coverLetterFields, append: appendCoverLetter, remove: removeCoverLetter } = useFieldArray({
    control,
    name: 'coverLetters'
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setValue('resume', file);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    
    // Append regular fields
    Object.keys(data).forEach(key => {
      if (Array.isArray(data[key])) {
        data[key].forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(subKey => {
              formData.append(`${key}[${index}][${subKey}]`, item[subKey]);
            });
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        Object.keys(data[key]).forEach(subKey => {
          formData.append(`${key}[${subKey}]`, data[key][subKey]);
        });
      } else {
        formData.append(key, data[key]);
      }
    });

    try {
      await axios.post('http://127.0.0.1:8000/api/submit-job-application/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      alert('Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    }
  };

  return (
    <Container>
      <FormContainer>
        <Title>Job Application Form</Title>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <FieldRow>
            <FormGroup>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="First Name" variant="outlined" aria-required="true" />}
              />
              {errors.firstName && <ErrorText>{errors.firstName.message}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Last Name" variant="outlined" aria-required="true" />}
              />
              {errors.lastName && <ErrorText>{errors.lastName.message}</ErrorText>}
            </FormGroup>
          </FieldRow>

          <FormGroup>
            <Controller
              name="includeOtherName"
              control={control}
              render={({ field }) => (
                <FormGroup>
                  <label>
                    <input type="checkbox" {...field} />
                    Include Other Name
                  </label>
                </FormGroup>
              )}
            />
          </FormGroup>

          {watch('includeOtherName') && (
            <FormGroup>
              <Controller
                name="otherName"
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Other Name" variant="outlined" />}
              />
              {errors.otherName && <ErrorText>{errors.otherName.message}</ErrorText>}
            </FormGroup>
          )}

          <FormGroup>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextFieldStyled {...field} label="Email" variant="outlined" />}
            />
            {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <TextFieldStyled {...field} label="Phone" variant="outlined" />}
            />
            {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
          </FormGroup>

          <Subheading>Job Positions</Subheading>
          {jobPositionFields.map((field, index) => (
            <FormGroup key={field.id}>
              <Controller
                name={`jobPositions[${index}]`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Job Position" variant="outlined" />}
              />
              {errors.jobPositions?.[index] && <ErrorText>{errors.jobPositions[index].message}</ErrorText>}
              
              <IconButton onClick={() => removeJobPosition(index)} color="error">
                <RemoveIcon />
              </IconButton>
            </FormGroup>
          ))}
          <ButtonStyled onClick={() => appendJobPosition('')} startIcon={<AddIcon />}>
            Add Job Position
          </ButtonStyled>

          <Subheading>Education</Subheading>
          {educationFields.map((field, index) => (
            <FormGroup key={field.id}>
              <Controller
                name={`education[${index}].institution`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Institution" variant="outlined" />}
              />
              {errors.education?.[index]?.institution && <ErrorText>{errors.education[index].institution.message}</ErrorText>}
              
              <Controller
                name={`education[${index}].degree`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Degree" variant="outlined" />}
              />
              {errors.education?.[index]?.degree && <ErrorText>{errors.education[index].degree.message}</ErrorText>}
              
              <Controller
                name={`education[${index}].graduationYear`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Graduation Year" variant="outlined" type="number" />}
              />
              {errors.education?.[index]?.graduationYear && <ErrorText>{errors.education[index].graduationYear.message}</ErrorText>}
              
              <IconButton onClick={() => removeEducation(index)} color="error">
                <RemoveIcon />
              </IconButton>
            </FormGroup>
          ))}
          <ButtonStyled onClick={() => appendEducation({ institution: '', degree: '', graduationYear: '' })} startIcon={<AddIcon />}>
            Add Education
          </ButtonStyled>

          <Subheading>Work Experience</Subheading>
          {experienceFields.map((field, index) => (
            <FormGroup key={field.id}>
              <Controller
                name={`experience[${index}].company`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Company" variant="outlined" />}
              />
              {errors.experience?.[index]?.company && <ErrorText>{errors.experience[index].company.message}</ErrorText>}
              
              <Controller
                name={`experience[${index}].position`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Position" variant="outlined" />}
              />
              {errors.experience?.[index]?.position && <ErrorText>{errors.experience[index].position.message}</ErrorText>}
              
              <Controller
                name={`experience[${index}].startDate`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="Start Date" variant="outlined" type="date" InputLabelProps={{ shrink: true }} />}
              />
              {errors.experience?.[index]?.startDate && <ErrorText>{errors.experience[index].startDate.message}</ErrorText>}
              
              <Controller
                name={`experience[${index}].endDate`}
                control={control}
                render={({ field }) => <TextFieldStyled {...field} label="End Date" variant="outlined" type="date" InputLabelProps={{ shrink: true }} />}
              />
              {errors.experience?.[index]?.endDate && <ErrorText>{errors.experience[index].endDate.message}</ErrorText>}
              
              <Controller
                name={`experience[${index}].responsibilities`}
                control={control}
                render={({ field }) => <WideTextArea {...field} label="Responsibilities" variant="outlined" multiline />}
              />
              {errors.experience?.[index]?.responsibilities && <ErrorText>{errors.experience[index].responsibilities.message}</ErrorText>}
              
              <IconButton onClick={() => removeExperience(index)} color="error">
                <RemoveIcon />
              </IconButton>
            </FormGroup>
          ))}
          <ButtonStyled onClick={() => appendExperience({ company: '', position: '', startDate: '', endDate: '', responsibilities: '' })} startIcon={<AddIcon />}>
            Add Experience
          </ButtonStyled>

          <Subheading>Cover Letters</Subheading>
          {coverLetterFields.map((field, index) => (
            <FormGroup key={field.id}>
              <Controller
                name={`coverLetters[${index}]`}
                control={control}
                render={({ field }) => <WideTextArea {...field} label="Cover Letter" variant="outlined" multiline />}
              />
              {errors.coverLetters?.[index] && <ErrorText>{errors.coverLetters[index].message}</ErrorText>}
              
              <IconButton onClick={() => removeCoverLetter(index)} color="error">
                <RemoveIcon />
              </IconButton>
            </FormGroup>
          ))}
          <ButtonStyled onClick={() => appendCoverLetter('')} startIcon={<AddIcon />}>
            Add Cover Letter
          </ButtonStyled>

          <FormGroup>
            <input type="file" accept=".pdf,.doc" onChange={handleFileChange} />
            {errors.resume && <ErrorText>{errors.resume.message}</ErrorText>}
          </FormGroup>

          <ButtonStyled type="submit" endIcon={<SendIcon />} style={{ marginTop: '16px' }}>
            Send
          </ButtonStyled>
        </form>
      </FormContainer>
    </Container>
  );
};

export default JobForm;
