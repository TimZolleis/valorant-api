import { Link } from '@remix-run/react';
import { Container } from '~/ui/container/Container';
import { DefaultButton } from '~/ui/common/DefaultButton';

const MatchDetailsPage = () => {
    return (
        <div className={'text-white mt-5'}>
            <NoDetailsComponent></NoDetailsComponent>
        </div>
    );
};

const NoDetailsComponent = () => {
    return (
        <Container>
            <p className={'font-semibold text-center text-title-large'}>No details to show</p>
            <p className={'text-center font-inter text-label-medium text-gray-400'}>
                There are currently no match details to show.
            </p>
            <div className={'flex w-full items-center justify-center mt-3'}>
                <Link to={'/'}>
                    <DefaultButton>
                        <p className={'text-black'}>Go back</p>
                    </DefaultButton>
                </Link>
            </div>
        </Container>
    );
};

export default MatchDetailsPage;
