export default (form, output) => {
    var hsts = '';

 if (form.hsts) {
    hsts =
`
  # ${form.serverName} doesn't support HSTS, but it can redirect to HTTPS
  ExampleALBHTTPToHTTPSRedirect:
    Type: AWS::ElasticLoadBalancingV2::Listener
    DependsOn: ExampleALB
    Properties:
      DefaultActions:
        - RedirectConfig:
            Host: "#{host}"
            Path: "/#{path}"
            Port: 443
            Protocol: "HTTPS"
            Query: "#{query}"
            StatusCode: HTTP_${output.hstsRedirectCode}
          Type: redirect
      LoadBalancerArn: !Ref ExampleALB
      Port: 80
      Protocol: HTTP
`;
 }

    var sslpolicy = output.protocols.includes('TLSv1')
      ? 'ELBSecurityPolicy-TLS-1-0-2015-04'
      : output.protocols.includes('TLSv1.2')
        ? 'ELBSecurityPolicy-TLS13-1-2-Res-2021-06'
        : 'ELBSecurityPolicy-TLS13-1-3-2021-06';

    var conf =
`# Please note that Application Load Balancers don't allow you to directly specify protocols
# and ciphers, so this is the closest existing mapping from the Mozilla ${form.config}
# profile onto an existing Amazon SSL Security Policy. For additional information, please see:
# https://docs.aws.amazon.com/elasticloadbalancing/latest/application/create-https-listener.html#describe-ssl-policies
AWSTemplateFormatVersion: 2010-09-09
Description: Mozilla ALB configuration generated ${output.date}, ${output.link}
Parameters:
  SSLCertificateId:
    Description: The ARN of the ACM SSL certificate to use
    Type: String
    AllowedPattern: ^arn:aws:acm:[^:]*:[^:]*:certificate/.*$
    ConstraintDescription: >
      SSL Certificate ID must be a valid ACM ARN.
      https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html#genref-arns
Resources:
  ExampleALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    DependsOn: ExampleVPCGatewayAttachment
    Properties:
      SecurityGroups:
        - !Ref ExampleSecurityGroup
      Subnets:
        - !Ref ExampleSubnet1
        - !Ref ExampleSubnet2
  ExampleALBListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      Certificates:
        - CertificateArn: !Ref SSLCertificateId
      DefaultActions:
        # For simplicity, this example doesn't send traffic to a backend EC2 instance
        # or Lambda function and instead just returns a static page. To change this
        # to use a real backend, use the "forward" action type in DefaultActions and
        # provision a "AWS::ElasticLoadBalancingV2::TargetGroup" resource
        - FixedResponseConfig:
            ContentType: text/html
            MessageBody: You've reached your ${form.serverName}
            StatusCode: '200'
          Type: fixed-response
      LoadBalancerArn: !Ref ExampleALB
      Port: 443
      Protocol: HTTPS
      SslPolicy: ${sslpolicy}
${hsts}
  # Everything that follows is the infrastructure to enable an AWS ALB to be provisioned
  # If you have pre-existing resources like a VPC, subnets, route tables, etc you don't
  # need to provision these and instead you can merely reference them above.
  ExampleVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 172.28.200.0/24
  ExampleIGW:
    Type: AWS::EC2::InternetGateway
  ExampleVPCGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      InternetGatewayId: !Ref ExampleIGW
      VpcId: !Ref ExampleVPC
  ExampleRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref ExampleVPC
  ExampleRoute:
    Type: AWS::EC2::Route
    DependsOn: ExampleVPCGatewayAttachment
    Properties:
      RouteTableId: !Ref ExampleRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref ExampleIGW
  ExampleSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      CidrBlock: 172.28.200.0/25
      AvailabilityZone: !Select
        - 0
        - Fn::GetAZs: !Ref 'AWS::Region'
      VpcId: !Ref ExampleVPC
  ExampleSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      CidrBlock: 172.28.200.128/25
      AvailabilityZone: !Select
        - 1
        - Fn::GetAZs: !Ref 'AWS::Region'
      VpcId: !Ref ExampleVPC
  ExampleSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref ExampleSubnet1
      RouteTableId: !Ref ExampleRouteTable
  ExampleSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    Properties:
      SubnetId: !Ref ExampleSubnet2
      RouteTableId: !Ref ExampleRouteTable
  ExampleSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Allow inbound traffic from the internet
      SecurityGroupIngress:
        - CidrIp: 0.0.0.0/0
          IpProtocol: '-1'
      VpcId: !Ref ExampleVPC

Outputs:
  ALBURL:
    Description: URL of the ALB load balancer
    Value: !Join [ '', [ 'https://', !GetAtt 'ExampleALB.DNSName', '/' ] ]
`;

  return conf;
};
