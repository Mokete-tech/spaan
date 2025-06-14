
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from "./AuthForm";

const AuthTabs: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <AuthForm type="signin" onSuccess={() => navigate("/")} />
      </TabsContent>
      
      <TabsContent value="signup">
        <AuthForm type="signup" />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
