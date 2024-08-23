type SuccessProps = {
  transactionHash: string;
};
function SuccessScreen(props: SuccessProps) {
  const { transactionHash } = props;
  return (
    <>
      <h1 className="bg-gradient-to-br bg-clip-text text-[2rem] text-center">
        Purchase Successful
      </h1>
      <a
        className="bg-gradient-to-br bg-clip-text text-[1rem] text-center"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://amoy.polygonscan.com/tx/${transactionHash}`}>
        Transaction:{" "}
        <span className="text-primary bg-gradient-to-br bg-clip-text text-[1rem] text-center">
          {" "}
          {transactionHash}
        </span>
      </a>
      <p className="bg-gradient-to-br bg-clip-text text-[1rem] text-center">
        You can close the page now
      </p>
    </>
  );
}

export default SuccessScreen;
