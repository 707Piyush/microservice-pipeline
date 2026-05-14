pipeline {
    agent any
    environment {
        DOCKER_IMAGE = "piyushgupta7781/microservice-app"
        DOCKER_TAG = "build-${env.BUILD_NUMBER}"
    }
    stages {
        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }
        stage('Push') {
            steps {
                echo 'Pushing image to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying to Kubernetes...'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh "kubectl --kubeconfig=$KUBECONFIG apply -f k8s/deployment.yaml"
                    sh "kubectl --kubeconfig=$KUBECONFIG apply -f k8s/service.yaml"
                    sh "kubectl --kubeconfig=$KUBECONFIG set image deployment/microservice-app microservice-app=${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "kubectl --kubeconfig=$KUBECONFIG rollout status deployment/microservice-app"
                }
            }
        }
    }
    post {
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed. Check the logs above.' }
    }
}