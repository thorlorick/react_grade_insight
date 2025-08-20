const handleTeacherLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('/api/login/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // redirect to teacher dashboard
      window.location.href = `/teacher/${data.teacher_id}-dashboard`;
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Server error. Try again later.');
  }
};
