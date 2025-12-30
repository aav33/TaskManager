const items = document.querySelectorAll('.faq-item');

items.forEach(item => {
  const button = item.querySelector('.faq-question');

  button.addEventListener('click', () => {
    items.forEach(i => {
      if (i !== item) {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    item.classList.toggle('active');
    const answer = item.querySelector('.faq-answer');

    if (item.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    } else {
      answer.style.maxHeight = null;
    }
  });
});