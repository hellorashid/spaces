import { Popover, Button, Flex, Avatar, TextArea, Box, Text, Checkbox, IconButton } from '@radix-ui/themes';
import { useAuth } from '../utils/BasicContext';
import { UserIcon } from "@heroicons/react/24/outline";



const LoginButton = () => {
    const { user, isLoaded, isSignedIn, getSignInLink, getToken, signin, signout } = useAuth();

    const debug = () => {
        console.log('user', user);
        console.log('isLoaded', isLoaded, isSignedIn);
        console.log(getSignInLink());
        console.log(getToken());
    }


    if (!isLoaded) return null;
    if (!isSignedIn) return (
        <Popover.Root>
            <Popover.Trigger>
                <IconButton>
                 <UserIcon width="25px" />
                </IconButton>
            </Popover.Trigger>
            <Popover.Content width="300px">
                <Flex gap="3">
                    <Box flexGrow="1">
                        <div>
                            <Button variant="solid" size="3" highContrast onClick={signin} >Login </Button>
                            <h2 className='font-mono text-sm mt-4'>spaces uses Basic for login, so your data is always private</h2>
                        </div>
                    </Box>
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Avatar
                    size="2"
                    src={`https://api.dicebear.com/8.x/fun-emoji/svg?seed=${user?.email}`}
                    fallback="A"
                    radius="full"
                    className='grayscale'
                />
            </Popover.Trigger>
            <Popover.Content width="200px">
                <div className='flex flex-col gap-2 font-mono'>
                    <Text size={"1"}>signed in as:</Text>
                    <Text size="2" weight="medium">{user?.email}</Text>

            
                    <Button variant="outline" size="1" onClick={signout} className='mt-4' >logout</Button>
              
                </div>
            </Popover.Content>
        </Popover.Root>
    )
}

export default LoginButton;