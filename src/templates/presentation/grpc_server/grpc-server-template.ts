import * as changeCase from "change-case";

export function getGrpcServerTemplate(grpcServerName: string): string {
	return `package grpc_server

import (
	"log"
	"net"

	"${changeCase.snakeCase(grpcServerName)}.service.com/src/presentation/grpc_server/grpc_services"
	"google.golang.org/grpc"
)

func StartGrpcServer() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}
	grpcServer := grpc.NewServer()
	grpc_services.Register${changeCase.pascalCase(grpcServerName)}GrpcServiceServer(grpcServer, &grpc_services.${changeCase.pascalCase(grpcServerName)}GrpcService{})
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("Failed to serve grpc in port :50051 %v", err)
	}
}   
`;
}