import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  const beginTest = () => {
    navigate('/decoding');
  };

  return (
    <div>
      <h1>Online DESD</h1>
      <p>
        The DESD is a screening test that allows for assessment of a student's specific reading difficulties and whether the student is at risk for dyslexia. The test identifies the specific skills that a child brings to bear on the task of reading words. It consists of three sections: Decoding, Eidetic Encoding, and Phonetic Encoding.
      </p>
      <p>
        The Decoding section provides a measure of sight-word recognition (Reading Standard Score). Indicators in the Encoding section allow the examiner to distinguish deficits in sight-word recognition from deficits in phonetic analysis. This makes it easier to detect and describe reading problems and to refer students for appropriate educational therapy.
      </p>
      <button onClick={beginTest}>Begin Test</button>
    </div>
  );
};

export default Welcome;
