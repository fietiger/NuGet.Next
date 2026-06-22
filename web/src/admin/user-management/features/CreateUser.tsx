import { EmojiPicker, Form, Input, Modal } from "@lobehub/ui";
import { Button, message, Select } from "antd";
import Password from "antd/es/input/Password";
import { createUser } from "@/services/UserService";

interface CreateUserProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CreateUser = (props: CreateUserProps) => {

    function handleSubmit(values: any) {
        createUser(values).then((res) => {
            if (res.success) {
                message.success('创建成功');
                props.onSubmit();
            } else {
                message.error(res.message);
            }
        }).catch(() => {
            message.error('创建失败');
        });

    }

    return (
        <Modal footer={[]} open={props.open} onCancel={props.onClose}>
            <Form onFinish={handleSubmit}>
                <Form.Item label="头像" initialValue={'https://avatars.githubusercontent.com/u/61819790?v=4'} name="avatar" >
                    <EmojiPicker
                        customEmojis={[
                            {
                                emojis: [
                                    {
                                        id: 'logo',
                                        keywords: ['lobechat', 'lobehub'],
                                        name: 'LobeHub Logo',
                                        skins: [
                                            {
                                                src: 'https://avatars.githubusercontent.com/u/61819790?v=4',
                                            },
                                        ],
                                    },
                                ],
                                id: 'lobehub',
                                name: 'LobeHub',
                            },
                        ]}
                    />
                </Form.Item>
                <Form.Item rules={[
                    {
                        required: true,
                        message: '请输入用户名',
                    },
                    {
                        max: 20,
                        message: '用户名最多20个字符'
                    },
                    {
                        min: 5,
                        message: '用户名最少5个字符'
                    },
                    {
                        pattern: /^[a-zA-Z0-9]+$/,
                        message: '用户名只能包含字母、数字'
                    }
                ]} label="用户名" name="username" required>
                    <Input />
                </Form.Item>
                <Form.Item label="密码" name="password" required>
                    <Password />
                </Form.Item>
                <Form.Item rules={[
                    {
                        type: 'email',
                        message: '请输入正确的邮箱地址',
                    },
                    {
                        required: true,
                        message: '请输入邮箱地址',
                    }
                ]} label="邮箱" name="email" required>
                    <Input />
                </Form.Item>
                <Form.Item rules={[
                    {
                        required: true,
                        message: '请输入昵称',
                    },
                    {
                        max: 20,
                        message: '昵称最多20个字符'
                    },
                    {
                        min: 2,
                        message: '昵称最少2个字符'
                    }
                ]} label="昵称" name="fullName" required>
                    <Input />
                </Form.Item>
                <Form.Item initialValue={'user'} label="角色" name="role" required>
                    <Select
                        style={{
                            width: 200
                        }}>
                        <Select.Option value="admin">管理员</Select.Option>
                        <Select.Option value="user">用户</Select.Option>
                    </Select>
                </Form.Item>
                <Button block htmlType="submit">提交</Button>
            </Form>
        </Modal>
    );
}

export default CreateUser;
