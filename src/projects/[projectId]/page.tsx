

interface Props {
    params: Promise<{
        projectId: string
    }>
};

const Page = async ({ params }: Props) => {
    const { projectId } = await params;

    return (
        <div>
            Project Id
        </div>
    )
}

export default Page;